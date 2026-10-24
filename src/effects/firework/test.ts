import { describe, expect, it } from '@rstest/core';
import { resolveConfig } from '@/core/define-effect';
import { createSimulation, type Simulation } from '@/core/simulation';
import { type FireworkConfig, firework } from '@/effects/firework';
import { seedOf } from './noise';

const origin = { x: 0, y: 0 };

const simulate = (overrides: Partial<FireworkConfig> = {}, seed = 1) =>
  createSimulation(firework, resolveConfig(firework, overrides), {
    origin,
    seed,
  });

const field = (
  simulation: Simulation,
  name: keyof Simulation['pool']['fields']
) =>
  Array.from(simulation.pool.fields[name].subarray(0, simulation.pool.count));

/** Steps `seconds` at `hz` steps per second. */
const run = (simulation: Simulation, seconds: number, hz = 60) => {
  for (let i = 0; i < Math.round(seconds * hz); i++) simulation.step(1 / hz);
  return simulation;
};

/** Roles in `s0`, as in `effect.ts`. A rocket's `s0` is negative. */
const PEONY = 0;
const WILLOW = 1;
const CRACKLE = 2;
const TRAIL = 3;
const SPARK = 4;
const FLASH = 5;

/** One straight-up rocket, so its flight is the closed form's. */
const straight = { count: 1, spread: 0, spiral: 0 };

/** The closed forms of a rocket's climb, from launch speed `u` upwards. */
const climb = (u: number, k = 2.5, g = 250) => {
  const terminal = g / k;
  const top = Math.log(1 + u / terminal) / k;
  /** Height above the launch, `t` seconds in. */
  const height = (t: number) =>
    ((u + terminal) * (1 - Math.exp(-k * t))) / k - terminal * t;
  return {
    top,
    apex: height(top),
    burst: 0.9 * top,
    height,
  };
};

/** A rocket's launch speed, from its slots. */
const launch = (simulation: Simulation, i = 0) =>
  Math.hypot(field(simulation, 's1')[i] ?? 0, field(simulation, 's2')[i] ?? 0);

/**
 * Each particle by a key that names it in any run of the same burst: a
 * rocket by its `s0`, everything else by its role and seed. Keys two
 * particles share are left out.
 */
const byKey = (simulation: Simulation) => {
  const s0 = field(simulation, 's0');
  const s2 = field(simulation, 's2');
  const x = field(simulation, 'x');
  const y = field(simulation, 'y');
  const found = new Map<string, { x: number; y: number }>();
  const shared = new Set<string>();
  for (let i = 0; i < simulation.pool.count; i++) {
    const role = s0[i] ?? 0;
    const key = role < 0 ? `rocket ${role}` : `${role} ${s2[i]}`;
    if (found.has(key)) shared.add(key);
    found.set(key, { x: x[i] ?? 0, y: y[i] ?? 0 });
  }
  for (const key of shared) found.delete(key);
  return found;
};

const count = (simulation: Simulation, role: number) =>
  field(simulation, 's0').filter((value) => value === role).length;

describe('firework', () => {
  it('has its defaults, frozen, and glows', () => {
    expect(firework.defaults).toEqual({
      count: 3,
      size: 5,
      colors: ['#FF3B4E', '#4DFF88', '#4D7CFF', '#FFD84A', '#FFFFFF'],
      angle: 90,
      spread: 60,
      velocity: 1000,
      drag: 2.5,
      gravity: 250,
      spiral: 5,
      stars: 40,
      radius: 110,
      peony: 1,
      willow: 1,
      crackle: 1,
      lifetime: 3500,
    });
    expect(Object.isFrozen(firework.defaults)).toBe(true);
    expect(firework.blend).toBe('additive');
  });

  it('draws a glow per colour, then gold stars, trails, sparks and a flash', () => {
    const config = resolveConfig(firework, { size: 10, colors: ['#000'] });
    // A glow's box is three times its core, so the halo shows.
    expect(firework.sprites(config)).toMatchObject([
      { key: 'firework-glow|#000', width: 30, height: 30 },
      { key: 'firework-glow|#FFA944', width: 30, height: 30 },
      { key: 'firework-glow|#FFA944', width: 18, height: 18 },
      { key: 'firework-glow|#FFF1C9', width: 18, height: 18 },
      { key: 'firework-flash', width: 120, height: 120 },
    ]);
    expect(firework.sprites(resolveConfig(firework))).toHaveLength(9);
  });

  it('launches count rockets, one to each share of the fan', () => {
    const simulation = simulate({ count: 9, spread: 90, velocity: 1000 });
    expect(field(simulation, 's0').every((role) => role < 0)).toBe(true);
    const angles = field(simulation, 's1')
      .map((ux, i) => {
        const uy = field(simulation, 's2')[i] ?? 0;
        return (Math.atan2(-uy, ux) * 180) / Math.PI;
      })
      .sort((a, b) => a - b);
    // Nine shares of 10° from 45° to 135°, each rocket within 3° of the
    // middle of its own.
    for (const [slot, angle] of angles.entries()) {
      expect(Math.abs(angle - (50 + slot * 10))).toBeLessThanOrEqual(3);
    }
    for (let i = 0; i < 9; i++) {
      expect(launch(simulation, i)).toBeGreaterThanOrEqual(900 - 1e-3);
      expect(launch(simulation, i)).toBeLessThanOrEqual(1100 + 1e-3);
    }
  });

  it('launches the first rocket at once, and the rest within 0.45 s', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const simulation = simulate({}, seed);
      const delays = field(simulation, 'life').map(
        (life, i) => life - climb(launch(simulation, i)).burst
      );
      expect(delays[0]).toBeCloseTo(0, 5);
      for (const delay of delays.slice(1)) {
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(0.45 + 1e-5);
      }
      // Waiting rockets are hidden.
      expect(field(simulation, 'alpha')).toEqual(
        delays.map((delay) => (delay > 1e-5 ? 0 : 1))
      );
    }
  });

  it('gives each rocket of a volley the next kind and the next colour', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const simulation = simulate({}, seed);
      const kinds = field(simulation, 's0').map((s0) => (-s0 - 1) % 4);
      // With equal weights, three rockets are one of each kind.
      expect([...kinds].sort()).toEqual([PEONY, WILLOW, CRACKLE]);
      // A willow is gold. The others take different colours.
      const sprites = field(simulation, 'sprite');
      for (const [i, kind] of kinds.entries()) {
        if (kind === WILLOW) expect(sprites[i]).toBe(5);
        else expect(sprites[i]).toBeLessThan(5);
      }
      const coloured = sprites.filter((sprite) => sprite < 5);
      expect(new Set(coloured).size).toBe(coloured.length);
    }
  });

  it('picks kinds in proportion to their weights', () => {
    const kinds = [0, 0, 0];
    for (let seed = 1; seed <= 2000; seed++) {
      const simulation = simulate(
        { count: 1, peony: 2, willow: 1, crackle: 1 },
        seed
      );
      const kind = (-(field(simulation, 's0')[0] ?? 0) - 1) % 4;
      kinds[kind] = (kinds[kind] ?? 0) + 1;
    }
    // Measured: 995, 489 and 516 of 2000. Three standard deviations of a
    // share of 2000 are at most 0.034.
    expect(Math.abs((kinds[PEONY] ?? 0) / 2000 - 0.5)).toBeLessThan(0.034);
    expect(Math.abs((kinds[WILLOW] ?? 0) / 2000 - 0.25)).toBeLessThan(0.03);
    expect(Math.abs((kinds[CRACKLE] ?? 0) / 2000 - 0.25)).toBeLessThan(0.03);

    for (let seed = 1; seed <= 200; seed++) {
      const simulation = simulate({ peony: 1, willow: 0, crackle: 3 }, seed);
      const s0 = field(simulation, 's0');
      expect(s0.every((code) => (-code - 1) % 4 !== WILLOW)).toBe(true);
    }
  });

  it('bursts at 0.9 of the time to its top, where the closed form puts it', () => {
    // At the defaults, a rocket launched at 1000 px/s would top out 304.1 px
    // up after 0.959 s. It bursts at 0.863 s, 302.8 px up.
    const defaults = climb(1000);
    expect(defaults.top).toBeCloseTo(0.959, 3);
    expect(defaults.apex).toBeCloseTo(304.08, 2);
    expect(defaults.burst).toBeCloseTo(0.863, 3);
    expect(defaults.height(defaults.burst)).toBeCloseTo(302.84, 2);

    for (const hz of [30, 60, 144]) {
      const simulation = simulate(straight, 4);
      const { burst, apex, height } = climb(launch(simulation));
      let time = 0;
      while (count(simulation, FLASH) === 0) {
        simulation.step(1 / hz);
        time += 1 / hz;
      }
      // It bursts in the step that passes its fuse, at the exact point.
      expect(time).toBeGreaterThanOrEqual(burst - 1e-6);
      expect(time).toBeLessThan(burst + 1 / hz);
      const flash = field(simulation, 's0').indexOf(FLASH);
      expect(field(simulation, 'x')[flash]).toBeCloseTo(0, 3);
      expect(-(field(simulation, 'y')[flash] ?? 0)).toBeCloseTo(
        height(burst),
        2
      );
      expect(height(burst) / apex).toBeGreaterThan(0.99);
    }
  });

  it('climbs on a spiral as wide as spiral, turning every 64 px', () => {
    const simulation = simulate({ ...straight, spiral: 5 }, 2);
    const { burst, height } = climb(launch(simulation));
    const sides: number[] = [];
    for (let step = 0; step < Math.floor(burst * 144); step++) {
      simulation.step(1 / 144);
      sides.push(field(simulation, 'x')[0] ?? 0);
    }
    const widest = Math.max(...sides.map(Math.abs));
    expect(widest).toBeLessThanOrEqual(5 + 1e-3);
    expect(widest).toBeGreaterThan(4.5);
    // A turn every 64 px crosses the path twice.
    let crossings = 0;
    for (let i = 1; i < sides.length; i++) {
      if (Math.sign(sides[i] ?? 0) !== Math.sign(sides[i - 1] ?? 0)) {
        crossings++;
      }
    }
    expect(Math.abs(crossings - (2 * height(burst)) / 64)).toBeLessThanOrEqual(
      1
    );

    const flat = simulate(straight, 2);
    run(flat, 0.5);
    expect(field(flat, 'x')[0]).toBeCloseTo(0, 9);
  });

  it('lays a trail spark every 6 px climbed, as many at any frame rate', () => {
    const laid = [30, 60, 144].map((hz) => {
      const simulation = run(simulate(straight, 3), 0.5, hz);
      return {
        laid: field(simulation, 's3')[0],
        live: count(simulation, TRAIL),
        height: -(field(simulation, 'y')[0] ?? 0),
      };
    });
    for (const { laid: total, live, height } of laid) {
      expect(total).toBe(Math.floor(height / 6));
      expect(total).toBe(laid[0]?.laid);
      expect(live).toBe(laid[0]?.live);
    }
  });

  it('matches within 1 px at 30, 60 and 144 Hz, particle by particle', () => {
    // Measured, against 144 Hz: at most 0.21 px at 30 Hz and 0.05 px at
    // 60 Hz, and the same particles in each run.
    for (const seed of [1, 2, 3]) {
      for (const seconds of [1, 1.5, 2, 2.5]) {
        const at = (hz: number) => byKey(run(simulate({}, seed), seconds, hz));
        const reference = at(144);
        for (const hz of [30, 60]) {
          const particles = at(hz);
          expect([...particles.keys()].sort()).toEqual(
            [...reference.keys()].sort()
          );
          for (const [key, { x, y }] of particles) {
            const there = reference.get(key);
            expect(
              Math.hypot(x - (there?.x ?? 0), y - (there?.y ?? 0))
            ).toBeLessThan(1);
          }
        }
      }
    }
  });

  it('ends every rocket, star, trail and spark by lifetime', () => {
    for (const lifetime of [3500, 2000, 600]) {
      for (const hz of [30, 60, 144]) {
        const simulation = simulate({ lifetime }, 5);
        const end = lifetime / 1000;
        let time = 0;
        // The latest any particle is due to end: now plus its life left.
        let latest = 0;
        while (!simulation.done) {
          simulation.step(1 / hz);
          time += 1 / hz;
          const age = field(simulation, 'age');
          for (const [i, life] of field(simulation, 'life').entries()) {
            latest = Math.max(latest, time + life - (age[i] ?? 0));
          }
        }
        expect(latest).toBeLessThanOrEqual(end + 1e-4);
        expect(time).toBeLessThanOrEqual(end + 1 / hz + 1e-9);
      }
    }
  });

  it('launches late rockets sooner, so every rocket bursts by lifetime', () => {
    // The last rocket would burst at about 1.3 s, so it launches sooner.
    const simulation = simulate({ lifetime: 1200 }, 3);
    for (const life of field(simulation, 'life')) {
      expect(life).toBeLessThanOrEqual(1.2 + 1e-6);
    }
    const flashes = new Set<number>();
    while (!simulation.done) {
      run(simulation, 1 / 60);
      const s0 = field(simulation, 's0');
      const s2 = field(simulation, 's2');
      for (const [i, role] of s0.entries()) {
        if (role === FLASH) flashes.add(s2[i] ?? 0);
      }
    }
    expect(flashes.size).toBe(3);
  });

  it('launches duds at once when the show is shorter than a climb', () => {
    const simulation = simulate({ lifetime: 600 });
    expect(field(simulation, 'alpha')).toEqual([1, 1, 1]);
    expect(field(simulation, 'life')).toEqual([0.6, 0.6, 0.6].map(Math.fround));
    let flashes = 0;
    let faded = 1;
    while (!simulation.done) {
      run(simulation, 1 / 60);
      flashes += count(simulation, FLASH);
      faded = Math.min(faded, ...field(simulation, 'alpha'));
    }
    expect(flashes).toBe(0);
    // They fade over the last 0.2 s.
    expect(faded).toBeLessThan(0.1);
  });

  it('replays a seeded burst exactly', () => {
    const a = run(simulate({}, 9), 2);
    const b = run(simulate({}, 9), 2);
    for (const name of ['x', 'y', 'alpha', 'scale', 'sprite'] as const) {
      expect(field(a, name)).toEqual(field(b, name));
    }
    expect(field(run(simulate({}, 10), 2), 'x')).not.toEqual(field(a, 'x'));
  });

  it('spreads a peony to radius, and droops it at gravity / 4', () => {
    const simulation = simulate(
      { ...straight, peony: 1, willow: 0, crackle: 0 },
      6
    );
    // The rocket's velocity at the burst, which the stars carry.
    const u = launch(simulation);
    const rocket = 100 - (u + 100) * Math.exp(-2.5 * climb(u).burst);
    while (count(simulation, FLASH) === 0) run(simulation, 1 / 144, 144);
    const flash = field(simulation, 's0').indexOf(FLASH);
    const centre = field(simulation, 'x')[flash] ?? 0;
    run(simulation, 0.75, 144);
    const s0 = field(simulation, 's0');
    const out = field(simulation, 'x')
      .filter((_, i) => s0[i] === PEONY)
      .map((x) => Math.abs(x - centre));
    const fall = field(simulation, 'vy').filter((_, i) => s0[i] === PEONY);
    expect(out).toHaveLength(40);
    // Stars launch at radius * 4, so 0.75 s on they are out up to
    // radius * (1 - e^-3), 104.5 px. Measured: the widest is 105.6 px out.
    const reach = 110 * (1 - Math.exp(-3));
    expect(Math.max(...out)).toBeGreaterThan(reach * 0.95);
    expect(Math.max(...out)).toBeLessThan(reach * 1.08);
    // On average they fall at gravity / 4 + (vy - gravity / 4) * e^-3, from
    // the rocket's vy at the burst. Measured: 58.29 px/s, against 58.10.
    const mean = fall.reduce((sum, vy) => sum + vy, 0) / fall.length;
    expect(mean).toBeCloseTo(
      62.5 * (1 - Math.exp(-3)) + rocket * Math.exp(-3),
      0
    );
  });

  it('hangs a willow trail: its sparks fall slower than its stars', () => {
    const simulation = simulate({ ...straight, peony: 0, crackle: 0 }, 7);
    run(simulation, 2);
    const s0 = field(simulation, 's0');
    const vy = field(simulation, 'vy');
    const mean = (role: number) => {
      const values = vy.filter((_, i) => s0[i] === role);
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    };
    // Stars settle at gravity / 3, 83 px/s, and trail sparks at gravity / 8,
    // 31 px/s. Measured: 79.9 and 28.7.
    expect(mean(WILLOW)).toBeGreaterThan(75);
    expect(mean(TRAIL)).toBeLessThan(35);
    // Trail sparks live 1.2 to 1.8 s, so the trail shows the star's path.
    const lives = field(simulation, 's1').filter((_, i) => s0[i] === TRAIL);
    expect(lives.length).toBeGreaterThan(100);
    for (const life of lives) {
      expect(life).toBeGreaterThanOrEqual(1.2 - 1e-6);
      expect(life).toBeLessThanOrEqual(1.8 + 1e-6);
    }
  });

  it('flickers a crackle star, darkens it, then pops it into sparks', () => {
    const simulation = simulate({ ...straight, peony: 0, willow: 0 }, 8);
    while (count(simulation, CRACKLE) === 0) run(simulation, 1 / 144, 144);
    const star = field(simulation, 's2')[
      field(simulation, 's0').indexOf(CRACKLE)
    ];
    const sparks = new Set(
      Array.from({ length: 6 }, (_, j) => seedOf(star ?? 0, j))
    );
    const find = () => {
      const s0 = field(simulation, 's0');
      const s2 = field(simulation, 's2');
      return s0.findIndex((role, i) => role === CRACKLE && s2[i] === star);
    };

    const alphas: number[] = [];
    let last = { x: 0, y: 0 };
    for (let i = find(); i >= 0; i = find()) {
      alphas.push(field(simulation, 'alpha')[i] ?? 0);
      last = {
        x: field(simulation, 'x')[i] ?? 0,
        y: field(simulation, 'y')[i] ?? 0,
      };
      run(simulation, 1 / 144, 144);
    }
    // Burning, then flashing and dimming at 12.5 Hz for 0.2 s, then dark for
    // 0.12 to 0.22 s.
    const lit = alphas.findIndex((alpha) => alpha !== 1);
    const dark = alphas.indexOf(0);
    expect(lit).toBeGreaterThan(0.45 * 144);
    expect((dark - lit) / 144).toBeGreaterThan(0.2 - 0.05 - 2 / 144);
    expect((dark - lit) / 144).toBeLessThan(0.2 + 2 / 144);
    const flicker = alphas.slice(lit, dark);
    expect(new Set(flicker)).toEqual(new Set([1, 0.15].map(Math.fround)));
    const gap = (alphas.length - dark) / 144;
    expect(alphas.slice(dark).every((alpha) => alpha === 0)).toBe(true);
    expect(gap).toBeGreaterThan(0.12 - 2 / 144);
    expect(gap).toBeLessThan(0.22 + 2 / 144);

    // It popped into six white-gold sparks where it went.
    const s0 = field(simulation, 's0');
    const s2 = field(simulation, 's2');
    const popped = s0
      .map((role, i) => ({ role, seed: s2[i] ?? 0, i }))
      .filter(({ role, seed }) => role === SPARK && sparks.has(seed));
    expect(popped).toHaveLength(6);
    for (const { i } of popped) {
      expect(field(simulation, 'sprite')[i]).toBe(7);
      const x = (field(simulation, 'x')[i] ?? 0) - last.x;
      const y = (field(simulation, 'y')[i] ?? 0) - last.y;
      expect(Math.hypot(x, y)).toBeLessThan(2);
    }
  });

  it('matches its snapshot after half a second at 60 Hz', () => {
    const simulation = run(simulate(), 0.5);
    const round = (value: number) => Math.round(value * 1000) / 1000;
    const state = Array.from({ length: 3 }, (_, i) =>
      Object.fromEntries(
        (['x', 'y', 'alpha', 'scale', 'sprite', 's3'] as const).map((name) => [
          name,
          round(field(simulation, name)[i] ?? Number.NaN),
        ])
      )
    );
    expect(simulation.pool.count).toMatchInlineSnapshot(`98`);
    expect(state).toMatchInlineSnapshot(`
      [
        {
          "alpha": 1,
          "s3": 39,
          "scale": 1.497,
          "sprite": 5,
          "x": 81.949,
          "y": -222.14,
        },
        {
          "alpha": 1,
          "s3": 35,
          "scale": 0.908,
          "sprite": 1,
          "x": -23.341,
          "y": -214.214,
        },
        {
          "alpha": 1,
          "s3": 25,
          "scale": 1.464,
          "sprite": 2,
          "x": -48.415,
          "y": -143.003,
        },
      ]
    `);
  });
});
