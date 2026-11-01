import { describe, expect, it } from '@rstest/core';
import { resolveConfig } from '@/core/define-effect';
import type { Simulation } from '@/core/simulation';
import { pop } from '@/effects/pop';
import { field, rounded, run, simulate } from '@/test-utils';
import { noise } from './noise';

/** Roles in `s0`, as in `effect.ts`. */
const LONG = 0;
const SHORT = 1;
const LONG_TAIL = 2;
const SHORT_TAIL = 3;
const DOT = 4;
const FLASH = 5;

/** The defaults' lifetime in seconds, radius and size. */
const T = 1.5;
const R = 80;
const SIZE = 18;
/** A streak's and the ring's air resistance per second at the defaults. */
const K = 6 / T;
const RING_K = 8 / T;

/** Where a star sets off and lands, from its kind and seed. */
const reach = (kind: number, seed: number, radius = R) => ({
  from: 0.2 * radius,
  to:
    radius * (kind === LONG ? 1 : 0.62) * (1 + 0.06 * (2 * noise(seed, 0) - 1)),
});

/** A star's size as a share of `size`, from its kind and seed. */
const sizeOf = (kind: number, seed: number) =>
  (kind === LONG ? 1 : 0.7) * (1 + 0.1 * (2 * noise(seed, 0) - 1));

/** The share of its way a star has covered `t` seconds into the pop. */
const covered = (kind: number, t: number) =>
  1 - Math.exp(-K * Math.max(0, t - (kind === LONG ? 0 : 0.06 * T)));

/** A CSS `cubic-bezier` easing's value at progress `x`, by bisection. */
const cubicBezier =
  (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
    const at = (a: number, b: number, t: number) =>
      3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
    let low = 0;
    let high = 1;
    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2;
      if (at(x1, x2, mid) < x) low = mid;
      else high = mid;
    }
    return at(y1, y2, (low + high) / 2);
  };

/** Every live particle with one role, with the fields the tests read. */
const all = (simulation: Simulation, role: number) => {
  const s0 = field(simulation, 's0');
  const names = [
    'x',
    'y',
    'rotation',
    'scale',
    'scaleX',
    'alpha',
    'sprite',
    's1',
    's2',
    's3',
    'life',
  ] as const;
  const fields = names.map((name) => field(simulation, name));
  return s0
    .map((value, i) => ({ value, i }))
    .filter(({ value }) => value === role)
    .map(({ i }) =>
      Object.fromEntries(names.map((name, n) => [name, fields[n]?.[i] ?? 0]))
    ) as Record<(typeof names)[number], number>[];
};

const count = (simulation: Simulation, role: number) =>
  field(simulation, 's0').filter((value) => value === role).length;

/**
 * Each particle by a key that names it in any run of the same pop: its role
 * and its `s1` and `s2`, which are a star's direction and seed, its streak's
 * too, or a dot's direction.
 */
const byKey = (simulation: Simulation) => {
  const s0 = field(simulation, 's0');
  const s1 = field(simulation, 's1');
  const s2 = field(simulation, 's2');
  const x = field(simulation, 'x');
  const y = field(simulation, 'y');
  const found = new Map<string, { x: number; y: number }>();
  for (let i = 0; i < simulation.pool.count; i++) {
    found.set(`${s0[i]} ${s1[i]} ${s2[i]}`, { x: x[i] ?? 0, y: y[i] ?? 0 });
  }
  return found;
};

describe('pop', () => {
  it('has its defaults, frozen, and the normal blend', () => {
    expect(pop.defaults).toEqual({
      count: 10,
      dots: 5,
      size: 18,
      radius: 80,
      swirl: 20,
      lifetime: 1500,
      bounce: true,
      colors: ['#FF4D79', '#F59E0B', '#8B5CF6', '#1FB2F5'],
    });
    expect(Object.isFrozen(pop.defaults)).toBe(true);
    expect(pop.blend).toBe('normal');
  });

  it('draws a star and a streak per colour, then a dot and the flash in the first colour', () => {
    const config = resolveConfig(pop, {
      size: 10,
      radius: 50,
      colors: ['#000', '#fff'],
    });
    // A star's box is 1.75 times its span, so its halo shows. A streak's is
    // twice its length, with its head in the middle.
    expect(pop.sprites(config)).toMatchObject([
      { key: 'pop-star|#000', width: 17.5, height: 17.5 },
      { key: 'pop-star|#fff', width: 17.5, height: 17.5 },
      { key: 'pop-tail|#000', width: 20, height: 7 },
      { key: 'pop-tail|#fff', width: 20, height: 7 },
      { key: 'pop-dot|#000', width: 2 * 2.4, height: 2 * 2.4 },
      { key: 'pop-flash|#000', width: 60, height: 60 },
    ]);
    expect(pop.sprites(resolveConfig(pop))).toHaveLength(10);
    expect(pop.sprites(resolveConfig(pop, { colors: [] }))).toEqual([]);
  });

  it('spawns count stars around the circle, long and short and coloured in turn', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const simulation = simulate(pop, { count: 10 }, seed);
      expect(simulation.pool.count).toBe(10);
      expect(field(simulation, 's0')).toEqual([0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
      // Each star in its own tenth of the circle, within 0.12 of a tenth of
      // its middle, so neighbours are 36° ± 8.64° apart.
      const s1 = field(simulation, 's1');
      for (let i = 0; i < 10; i++) {
        const gap =
          ((s1[(i + 1) % 10] ?? 0) - (s1[i] ?? 0) + Math.PI * 4) %
          (Math.PI * 2);
        expect(gap / (Math.PI * 2)).toBeGreaterThanOrEqual(0.1 - 0.024 - 1e-6);
        expect(gap / (Math.PI * 2)).toBeLessThanOrEqual(0.1 + 0.024 + 1e-6);
      }
      // The colours in turn, so neighbours differ.
      const sprites = field(simulation, 'sprite');
      for (let i = 1; i < 10; i++) {
        expect(sprites[i]).toBe(((sprites[i - 1] ?? 0) + 1) % 4);
      }
      // Each starts 0.2 of radius out, along its direction.
      for (const [i, x] of field(simulation, 'x').entries()) {
        const y = field(simulation, 'y')[i] ?? 0;
        expect(Math.hypot(x, y)).toBeCloseTo(16, 4);
        expect(Math.atan2(y, x)).toBeCloseTo(
          Math.atan2(Math.sin(s1[i] ?? 0), Math.cos(s1[i] ?? 0)),
          5
        );
      }
    }
  });

  it('adds a streak per star, then the ring and the flash, on its first step', () => {
    const simulation = simulate(pop, {}, 2);
    simulation.step(0);
    expect(simulation.pool.count).toBe(10 + 10 + 5 + 1);
    expect(count(simulation, LONG_TAIL)).toBe(5);
    expect(count(simulation, SHORT_TAIL)).toBe(5);
    expect(count(simulation, DOT)).toBe(5);
    expect(count(simulation, FLASH)).toBe(1);
    // Each streak takes its star's direction, seed and colour.
    const stars = [...all(simulation, LONG), ...all(simulation, SHORT)];
    const tails = [
      ...all(simulation, LONG_TAIL),
      ...all(simulation, SHORT_TAIL),
    ];
    for (const tail of tails) {
      const star = stars.find((s) => s.s1 === tail.s1 && s.s2 === tail.s2);
      expect(tail.sprite).toBe((star?.sprite ?? -1) + 4);
      expect(tail.x).toBe(star?.x);
      expect(tail.y).toBe(star?.y);
    }

    // No more on later steps.
    run(simulation, 0.05);
    expect(simulation.pool.count).toBe(26);

    const ringless = simulate(pop, { dots: 0 }, 2);
    ringless.step(0);
    expect(ringless.pool.count).toBe(21);
  });

  it('lands each star on its closed-form path: radius out, swirled 20° counter-clockwise', () => {
    // At the defaults a star has covered 63% of its way 0.25 s after its
    // launch and 95% after 0.75 s, so a long star is 76.8 px out by then.
    expect(1 - Math.exp(-K * 0.25)).toBeCloseTo(0.63, 2);
    expect(1 - Math.exp(-K * 0.75)).toBeCloseTo(0.95, 2);
    for (const [swirl, hz] of [
      [20, 144],
      [20, 30],
      [0, 60],
      [-45, 60],
    ] as const) {
      const t = 2 / 3;
      const simulation = run(simulate(pop, { swirl }, 3), t, hz);
      for (const kind of [LONG, SHORT]) {
        for (const star of all(simulation, kind)) {
          const { from, to } = reach(kind, star.s2);
          const q = covered(kind, t);
          const angle = star.s1 - ((swirl * Math.PI) / 180) * q;
          expect(star.x).toBeCloseTo(
            (from + (to - from) * q) * Math.cos(angle),
            3
          );
          expect(star.y).toBeCloseTo(
            (from + (to - from) * q) * Math.sin(angle),
            3
          );
          expect(to / R).toBeGreaterThanOrEqual(
            (kind === LONG ? 1 : 0.62) * 0.94
          );
          expect(to / R).toBeLessThanOrEqual((kind === LONG ? 1 : 0.62) * 1.06);
        }
      }
    }
  });

  it('stretches each streak back to the start, then twice the way its star has left', () => {
    // Straight out, so the length along the path is the distance out. The
    // streak spans the last ln 3 / k seconds: 0.275 s at the defaults, when
    // it is 2/3 of the way, 42.7 px for a long star.
    expect(Math.log(3) / K).toBeCloseTo(0.275, 3);
    const simulation = simulate(pop, { swirl: 0 }, 4);
    for (const [step, t] of [
      [0.1, 0.1],
      [0.2, 0.3],
    ] as const) {
      run(simulation, step, 120);
      for (const kind of [LONG, SHORT]) {
        for (const tail of all(simulation, kind + LONG_TAIL)) {
          const { from, to } = reach(kind, tail.s2);
          const q = covered(kind, t);
          const drawn = tail.scaleX * tail.scale * SIZE;
          if (q < 2 / 3) expect(drawn).toBeCloseTo((to - from) * q, 3);
          else expect(drawn).toBeCloseTo(2 * (to - from) * (1 - q), 3);
          // It points straight out, from its star.
          expect(Math.cos(tail.rotation - tail.s1)).toBeCloseTo(1, 6);
          expect(Math.hypot(tail.x, tail.y)).toBeCloseTo(
            from + (to - from) * q,
            3
          );
        }
      }
    }
  });

  it('races the ring out as one even circle, thinning, and gone by 0.45 of lifetime', () => {
    const simulation = simulate(pop, {}, 5);
    run(simulation, 0.1, 100);
    const dots = all(simulation, DOT);
    expect(dots).toHaveLength(5);
    // 0.3 to 1.15 of radius, covering 1 - e^(-5.33 t): 52.11 px at 0.1 s.
    const q = 1 - Math.exp(-RING_K * 0.1);
    const r = R * (0.3 + 0.85 * q);
    expect(r).toBeCloseTo(52.11, 2);
    const angles = dots
      .map(({ x, y }) => Math.atan2(y, x))
      .sort((a, b) => a - b);
    for (const [j, { x, y, scale, alpha }] of dots.entries()) {
      expect(Math.hypot(x, y)).toBeCloseTo(r, 3);
      expect(scale).toBeCloseTo(1 - 0.55 * q, 5);
      expect(alpha).toBeCloseTo(1 - (0.1 / (0.45 * T)) ** 2, 5);
      if (j > 0) {
        expect((angles[j] ?? 0) - (angles[j - 1] ?? 0)).toBeCloseTo(
          (Math.PI * 2) / 5,
          4
        );
      }
    }
    // The ring heads for 92 px, and is 90.1 px out when it is spent, 0.675 s
    // in: its last step at 100 Hz is 0.67 s in.
    expect(R * (0.3 + 0.85 * (1 - Math.exp(-RING_K * 0.675)))).toBeCloseTo(
      90.14,
      2
    );
    run(simulation, 0.57, 100);
    const last = all(simulation, DOT);
    expect(last).toHaveLength(5);
    const end = R * (0.3 + 0.85 * (1 - Math.exp(-RING_K * 0.67)));
    for (const { x, y } of last) expect(Math.hypot(x, y)).toBeCloseTo(end, 3);
    simulation.step(1 / 100);
    expect(count(simulation, DOT)).toBe(0);
  });

  it('flashes at the centre for the first 0.12 of lifetime, on 6 frames at 30 Hz', () => {
    const simulation = simulate(pop, {}, 6);
    simulation.step(0);
    const alphas: number[] = [];
    while (count(simulation, FLASH) > 0) {
      const [flash] = all(simulation, FLASH);
      expect(flash?.x).toBeCloseTo(0, 4);
      expect(flash?.y).toBeCloseTo(0, 4);
      alphas.push(flash?.alpha ?? 0);
      run(simulation, 1 / 30, 30);
    }
    // At 0 to 5/30 s, fading from 0.85 over 0.18 s.
    expect(alphas).toHaveLength(6);
    for (const [frame, alpha] of alphas.entries()) {
      expect(alpha).toBeCloseTo(0.85 * (1 - frame / 30 / (0.12 * T)), 5);
    }
  });

  it('hides a short star until its launch, and leads each streak with a small tip', () => {
    const simulation = simulate(pop, {}, 7);
    for (const star of all(simulation, LONG)) {
      expect(star.alpha).toBe(1);
      expect(star.scale).toBeCloseTo(0.35 * sizeOf(LONG, star.s2), 5);
    }
    for (const star of all(simulation, SHORT)) expect(star.alpha).toBe(0);
    // Short streaks launch 0.09 s in.
    run(simulation, 0.1, 100);
    for (const star of all(simulation, SHORT)) {
      expect(star.alpha).toBe(1);
      expect(star.scale).toBeCloseTo(0.35 * sizeOf(SHORT, star.s2), 5);
    }
  });

  it('blooms each star with an overshoot, then twinkles it every 0.33 to 0.5 s', () => {
    const gaps: number[] = [];
    for (let seed = 1; seed <= 10; seed++) {
      const simulation = simulate(pop, {}, seed);
      simulation.step(0);
      const stars = all(simulation, LONG).map(({ s2 }) => s2);
      const history = new Map<
        number,
        { t: number; scale: number; alpha: number }[]
      >();
      let t = 0;
      while (!simulation.done) {
        for (const star of all(simulation, LONG)) {
          const list = history.get(star.s2) ?? [];
          list.push({
            t,
            scale: star.scale / sizeOf(LONG, star.s2),
            alpha: star.alpha,
          });
          history.set(star.s2, list);
        }
        simulation.step(1 / 240);
        t += 1 / 240;
      }
      for (const star of stars) {
        const list = history.get(star) ?? [];
        // A tip until 0.25 of lifetime, 0.375 s, then it blooms to 1.16
        // (0.35 + 0.65 × 1.25) at 0.5625 s, and settles at 1 by 0.75 s.
        const tip = list.filter(({ t: at }) => at < 0.25 * T - 1e-3);
        for (const { scale } of tip) expect(scale).toBeCloseTo(0.35, 5);
        const bloom = list.filter(
          ({ t: at }) => at > 0.25 * T && at <= 0.5 * T
        );
        const peak = bloom.reduce((a, b) => (b.scale > a.scale ? b : a));
        expect(peak.scale).toBeCloseTo(1.1625, 3);
        expect(peak.t).toBeCloseTo(0.375 * T, 2);
        expect(bloom.at(-1)?.scale).toBeCloseTo(1, 3);

        // Twinkling, it dims by up to a quarter, and comes back to full
        // brightness every lifetime / 4.5 to lifetime / 3: 0.33 to 0.5 s,
        // 10 to 15 frames at 30 Hz.
        const twinkle = list.filter(({ t: at }) => at > 0.5 * T);
        expect(Math.min(...twinkle.map(({ alpha }) => alpha))).toBeLessThan(
          0.9
        );
        const brightest: number[] = [];
        for (let i = 1; i < twinkle.length - 1; i++) {
          const { alpha } = twinkle[i] ?? { alpha: 1 };
          expect(alpha).toBeGreaterThanOrEqual(0.75 - 1e-6);
          if (
            alpha > 0.99 &&
            alpha > (twinkle[i - 1]?.alpha ?? 1) &&
            alpha >= (twinkle[i + 1]?.alpha ?? 1)
          ) {
            brightest.push(twinkle[i]?.t ?? 0);
          }
        }
        for (let i = 1; i < brightest.length; i++) {
          const gap = (brightest[i] ?? 0) - (brightest[i - 1] ?? 0);
          gaps.push(gap);
          expect(gap).toBeGreaterThan(T / 4.5 - 2 / 240);
          expect(gap).toBeLessThan(T / 3 + 2 / 240);
        }
        // It shrinks to nothing by its end: within its last 1/240 s, under
        // easeOutCubic(1/240 / 0.375) = 3.3% of its size.
        expect(list.at(-1)?.scale).toBeLessThan(0.034);
      }
    }
    // Enough stars came back to full brightness twice to measure.
    expect(gaps.length).toBeGreaterThan(5);
  });

  it('ends every star, streak, dot and the flash by lifetime', () => {
    for (const lifetime of [1500, 600, 2400]) {
      for (const hz of [30, 60, 144]) {
        const simulation = simulate(pop, { lifetime }, 9);
        const end = lifetime / 1000;
        for (const life of field(simulation, 'life')) {
          expect(life).toBeGreaterThanOrEqual(0.92 * end - 1e-6);
          expect(life).toBeLessThanOrEqual(end + 1e-6);
        }
        let time = 0;
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

  it('plays the same pop slower at a longer lifetime', () => {
    // Twice the lifetime at half the frame rate is the same pop, step for
    // step.
    const quick = run(simulate(pop, {}, 10), 0.3, 60);
    const slow = run(simulate(pop, { lifetime: 3000 }, 10), 0.6, 30);
    expect(slow.pool.count).toBe(quick.pool.count);
    const reference = byKey(quick);
    for (const [key, { x, y }] of byKey(slow)) {
      const there = reference.get(key);
      expect(Math.hypot(x - (there?.x ?? 0), y - (there?.y ?? 0))).toBeLessThan(
        1e-3
      );
    }
    for (const name of ['alpha', 'scale', 'scaleX', 'rotation'] as const) {
      const a = field(quick, name);
      for (const [i, value] of field(slow, name).entries()) {
        expect(value).toBeCloseTo(a[i] ?? 0, 4);
      }
    }
  });

  it('matches within 0.001 px at 30, 60 and 144 Hz, particle by particle', () => {
    // Measured, against 144 Hz: at most 0.00003 px at 30 and 60 Hz, the
    // rounding of the pool's 32-bit floats, since everything is placed in
    // closed form, and the same particles in each run.
    for (const seed of [1, 2, 3]) {
      for (const seconds of [1 / 6, 1 / 3, 1 / 2, 2 / 3]) {
        const at = (hz: number) =>
          byKey(run(simulate(pop, {}, seed), seconds, hz));
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
            ).toBeLessThan(1e-3);
          }
        }
      }
    }
  });

  it('replays a seeded pop exactly', () => {
    const a = run(simulate(pop, {}, 11), 0.4);
    const b = run(simulate(pop, {}, 11), 0.4);
    for (const name of [
      'x',
      'y',
      'alpha',
      'scale',
      'rotation',
      'sprite',
    ] as const) {
      expect(field(a, name)).toEqual(field(b, name));
    }
    expect(field(run(simulate(pop, {}, 12), 0.4), 'x')).not.toEqual(
      field(a, 'x')
    );
  });

  it('shrinks its element away at the tap and springs it back as the stars bloom', () => {
    const animation = pop.animation?.(resolveConfig(pop));
    // Over 0.6 of lifetime, with offsets as shares of that: gone by 0.03 of
    // lifetime, hidden until 0.175, after the flash has gone at 0.12, and
    // back by 0.6.
    expect(animation).toEqual({
      duration: 900,
      keyframes: [
        { transform: 'scale(1)', easing: 'ease-in' },
        { transform: 'scale(0)', offset: 0.05 },
        {
          transform: 'scale(0)',
          offset: 0.175 / 0.6,
          easing: 'cubic-bezier(0.3, 1.9, 0.6, 1)',
        },
        { transform: 'scale(1)' },
      ],
    });
    // The spring overshoots to 1.21 at 0.377 of lifetime, as the long stars'
    // bloom peaks at 0.375, and ends flat, so it settles with no jolt.
    const spring = cubicBezier(0.3, 1.9, 0.6, 1);
    let peak = { at: 0, scale: 0 };
    for (let i = 0; i <= 1000; i++) {
      const scale = spring(i / 1000);
      if (scale > peak.scale) peak = { at: 0.175 + (0.425 * i) / 1000, scale };
    }
    expect(peak.scale).toBeCloseTo(1.213, 3);
    expect(peak.at).toBeCloseTo(0.377, 3);
    expect((spring(1) - spring(0.999)) / 0.001).toBeCloseTo(0, 1);

    // It plays the same share of a longer pop, and not at all without
    // bounce.
    expect(
      pop.animation?.(resolveConfig(pop, { lifetime: 3000 }))
    ).toMatchObject({ duration: 1800 });
    expect(pop.animation?.(resolveConfig(pop, { bounce: false }))).toBe(
      undefined
    );
  });

  it('matches its snapshot after half a second at 60 Hz', () => {
    const simulation = run(simulate(pop), 0.5);
    expect(simulation.pool.count).toMatchInlineSnapshot(`25`);
    expect(
      rounded(simulation, ['x', 'y', 'rotation', 'scale', 'alpha', 'sprite'], 3)
    ).toMatchInlineSnapshot(`
      [
        {
          "alpha": 1,
          "rotation": 3.673,
          "scale": 1.14,
          "sprite": 0,
          "x": -41.753,
          "y": -59.872,
        },
        {
          "alpha": 1,
          "rotation": 4.336,
          "scale": 0.503,
          "sprite": 1,
          "x": 1.116,
          "y": -44.987,
        },
        {
          "alpha": 1,
          "rotation": 4.977,
          "scale": 1.075,
          "sprite": 2,
          "x": 45.404,
          "y": -53.999,
        },
      ]
    `);
  });
});
