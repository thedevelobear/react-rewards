import { describe, expect, it } from '@rstest/core';
import { resolveConfig } from '@/core/define-effect';
import { createSimulation, type Simulation } from '@/core/simulation';
import { type ConfettiConfig, confetti } from '@/effects/confetti';

const origin = { x: 0, y: 0 };

const simulate = (overrides: Partial<ConfettiConfig> = {}, seed = 1) =>
  createSimulation(confetti, resolveConfig(confetti, overrides), {
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

/** Each piece's sideways speed without its flutter, for pieces `size` wide. */
const flightVx = (simulation: Simulation, size: number) => {
  const s0 = field(simulation, 's0');
  const s1 = field(simulation, 's1');
  return field(simulation, 'vx').map(
    (vx, i) => vx + size * 1.25 * (s1[i] ?? 0) * Math.sin(s0[i] ?? 0)
  );
};

/** How wide the middle 80% of the pieces spread, in pixels. */
const width = (simulation: Simulation) => {
  const x = field(simulation, 'x').sort((a, b) => a - b);
  const at = (share: number) => x[Math.floor(share * (x.length - 1))] ?? 0;
  return at(0.9) - at(0.1);
};

describe('confetti', () => {
  it('has the defaults of ADR 0026, frozen', () => {
    expect(confetti.defaults).toEqual({
      count: 50,
      size: 10,
      colors: ['#A45BF1', '#25C6F6', '#72F753', '#F76C88', '#F5F770'],
      angle: 90,
      spread: 45,
      velocity: 1500,
      drag: 3,
      gravity: 900,
      lifetime: 3000,
    });
    expect(Object.isFrozen(confetti.defaults)).toBe(true);
    expect(confetti.blend).toBe('normal');
  });

  it('draws one 8:5 rectangle per colour', () => {
    const config = resolveConfig(confetti, { size: 10, colors: ['#000'] });
    expect(confetti.sprites(config)).toEqual([
      { shape: 'rect', color: '#000', width: 10, height: 6.25 },
    ]);
    expect(confetti.sprites(resolveConfig(confetti))).toHaveLength(5);
  });

  it('spawns count pieces, each with one of the colours', () => {
    const simulation = simulate({ count: 200 });
    const sprites = field(simulation, 'sprite');
    expect(sprites).toHaveLength(200);
    expect(new Set(sprites)).toEqual(new Set([0, 1, 2, 3, 4]));
  });

  it('launches within the cone, at 0.5 to 1.5 times velocity', () => {
    const config = { count: 200, size: 8, velocity: 1000 };
    // The flutter adds at most 8 * 1.25 * 6 = 60 px/s to the launch.
    const flutter = 60;
    const right = simulate({ ...config, angle: 0, spread: 0 });
    for (const [i, vx] of field(right, 'vx').entries()) {
      expect(vx).toBeGreaterThanOrEqual(500 - flutter);
      expect(vx).toBeLessThanOrEqual(1500 + flutter);
      expect(Math.abs(field(right, 'vy')[i] ?? 0)).toBeLessThanOrEqual(flutter);
    }

    const up = simulate({ ...config, angle: 90, spread: 90 });
    const vy = field(up, 'vy');
    for (const [i, vx] of field(up, 'vx').entries()) {
      const degrees = (Math.atan2(-(vy[i] ?? 0), vx) * 180) / Math.PI;
      expect(degrees).toBeGreaterThan(45 - 5);
      expect(degrees).toBeLessThan(135 + 5);
    }
  });

  it('lives 85 to 100% of lifetime, so the burst ends by lifetime', () => {
    const simulation = simulate({ count: 200, lifetime: 2000 });
    for (const life of field(simulation, 'life')) {
      expect(life).toBeGreaterThanOrEqual(1.7 - 1e-6);
      expect(life).toBeLessThanOrEqual(2 + 1e-6);
    }
    run(simulation, 1.9);
    expect(simulation.done).toBe(false);
    run(simulation, 0.1 + 1 / 60);
    expect(simulation.done).toBe(true);
  });

  it('stays opaque until the last 20% of its life, then fades', () => {
    const simulation = run(simulate({ count: 100, lifetime: 1000 }), 0.6);
    expect(field(simulation, 'alpha').every((alpha) => alpha === 1)).toBe(true);
    run(simulation, 0.3);
    const alphas = field(simulation, 'alpha');
    expect(alphas.every((alpha) => alpha < 1)).toBe(true);
    expect(alphas.every((alpha) => alpha >= 0)).toBe(true);
  });

  it('flips: scaleY swings between -1 and 1', () => {
    const simulation = simulate({ count: 1 });
    const scales: number[] = [];
    for (let i = 0; i < 120; i++) {
      run(simulation, 1 / 60);
      scales.push(field(simulation, 'scaleY')[0] ?? 0);
    }
    expect(Math.min(...scales)).toBeLessThan(-0.95);
    expect(Math.max(...scales)).toBeGreaterThan(0.95);
  });

  it('rises, then falls at about gravity / drag', () => {
    const simulation = run(simulate({ count: 100 }), 0.3);
    const mean = (values: number[]) =>
      values.reduce((sum, value) => sum + value, 0) / values.length;
    expect(mean(field(simulation, 'y'))).toBeLessThan(-200);

    run(simulation, 1.7);
    // At 2 s every piece has slowed to near 900 / 3 = 300 px/s, plus a
    // flutter of at most 10 * 1.25 * 6 = 75 px/s.
    for (const vy of field(simulation, 'vy')) {
      expect(vy).toBeGreaterThan(300 - 80);
      expect(vy).toBeLessThan(300 + 80);
    }
  });

  it('ends within 1 px at 30, 60 and 144 Hz after 1 s and 2.5 s', () => {
    // Measured, against 144 Hz: 0.65 px at 30 Hz and 0.14 px at 60 Hz after
    // 1 s, and 0.71 px and 0.15 px after 2.5 s, when the pieces glide.
    for (const seconds of [1, 2.5]) {
      const at = (hz: number) => run(simulate({ count: 100 }, 3), seconds, hz);
      const reference = at(144);
      for (const hz of [30, 60]) {
        const simulation = at(hz);
        const x = field(simulation, 'x');
        const y = field(simulation, 'y');
        const refX = field(reference, 'x');
        const refY = field(reference, 'y');
        for (let i = 0; i < x.length; i++) {
          const gap = Math.hypot(
            (x[i] ?? 0) - (refX[i] ?? 0),
            (y[i] ?? 0) - (refY[i] ?? 0)
          );
          expect(gap).toBeLessThan(1);
        }
      }
    }
  });

  it('glides to either side at random (ADR 0059)', () => {
    const s1 = field(simulate({ count: 200 }), 's1');
    const left = s1.filter((speed) => speed < 0).length;
    expect(left).toBeGreaterThan(70);
    expect(left).toBeLessThan(130);
  });

  it('flies as without a glide while it rises and starts to fall', () => {
    const simulation = simulate({ count: 200, size: 8 });
    const launch = flightVx(simulation, 8);
    // The slowest piece tops out at 0.4 s, and glides from 0.85 s.
    run(simulation, 0.6);
    for (const [i, vx] of flightVx(simulation, 8).entries()) {
      expect(vx).toBeCloseTo((launch[i] ?? 0) * Math.exp(-3 * 0.6), 2);
    }
  });

  it('opens once it has fallen a while, instead of falling in a column', () => {
    const simulation = run(simulate({ count: 200 }), 1.25);
    const falling = width(simulation);
    run(simulation, 1.25);
    // Measured: 1.68 times as wide. Without the glide, 1.02 times.
    expect(width(simulation)).toBeGreaterThan(falling * 1.4);
  });

  it('falls evenly, with no gap in the middle', () => {
    const simulation = run(simulate({ count: 2000 }), 2.5);
    // The middle 80% of the pieces, in five bands of equal width.
    const x = field(simulation, 'x').sort((a, b) => a - b);
    const from = x[Math.floor(0.1 * x.length)] ?? 0;
    const to = x[Math.floor(0.9 * x.length)] ?? 0;
    const bands = [0, 0, 0, 0, 0];
    for (const value of x) {
      const band = Math.floor(((value - from) / (to - from)) * 5);
      if (band >= 0 && band < 5) bands[band] = (bands[band] ?? 0) + 1;
    }
    // Measured: 1.35 times the mean band. Gliding to the side a piece was
    // thrown instead left 0.33 times, a gap between two columns.
    const mean = (0.8 * x.length) / 5;
    expect(bands[2]).toBeGreaterThan(0.8 * mean);
  });

  it('never glides without drag or gravity', () => {
    for (const still of [{ drag: 0 }, { gravity: 0 }]) {
      const simulation = simulate({ count: 50, size: 8, ...still });
      const launch = flightVx(simulation, 8);
      run(simulation, 2);
      const slowed = Math.exp(-(still.drag ?? 3) * 2);
      for (const [i, vx] of flightVx(simulation, 8).entries()) {
        expect(vx).toBeCloseTo((launch[i] ?? 0) * slowed, 1);
      }
    }
  });

  it('matches its snapshot after half a second at 60 Hz', () => {
    const simulation = run(simulate({ count: 3 }), 0.5);
    const round = (value: number) => Math.round(value * 1000) / 1000;
    const state = Array.from({ length: simulation.pool.count }, (_, i) =>
      Object.fromEntries(
        (['x', 'y', 'vx', 'vy', 'rotation', 'scaleY', 'alpha'] as const).map(
          (name) => [name, round(field(simulation, name)[i] ?? Number.NaN)]
        )
      )
    );
    expect(state).toMatchInlineSnapshot(`
      [
        {
          "alpha": 1,
          "rotation": 4.524,
          "scaleY": 0.636,
          "vx": 35.513,
          "vy": 35.221,
          "x": -23.318,
          "y": -145.106,
        },
        {
          "alpha": 1,
          "rotation": -0.244,
          "scaleY": 0.974,
          "vx": -41.595,
          "vy": -114.595,
          "x": 10.222,
          "y": -333.844,
        },
        {
          "alpha": 1,
          "rotation": -0.703,
          "scaleY": 0.126,
          "vx": 41.89,
          "vy": 53.545,
          "x": 28.699,
          "y": -179.596,
        },
      ]
    `);
  });
});
