import { describe, expect, it } from '@rstest/core';
import { resolveConfig } from '@/core/define-effect';
import type { Simulation } from '@/core/simulation';
import { confetti } from '@/effects/confetti';
import { field, mean, run, simulate } from '@/test-utils';

/** How wide the middle 80% of the pieces spread, in pixels. */
const width = (simulation: Simulation) => {
  const x = field(simulation, 'x').sort((a, b) => a - b);
  const at = (share: number) => x[Math.floor(share * (x.length - 1))] ?? 0;
  return at(0.9) - at(0.1);
};

describe('confetti', () => {
  it('has the defaults of ADR 0026, frozen', () => {
    expect(confetti.defaults).toEqual({
      count: 100,
      size: 10,
      colors: ['#A45BF1', '#25C6F6', '#72F753', '#F76C88', '#F5F770'],
      angle: 90,
      spread: 60,
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
    const simulation = simulate(confetti, { count: 200 });
    const sprites = field(simulation, 'sprite');
    expect(sprites).toHaveLength(200);
    expect(new Set(sprites)).toEqual(new Set([0, 1, 2, 3, 4]));
  });

  it('launches within the cone, at 0.5 to 1.5 times velocity', () => {
    const config = { count: 200, velocity: 1000 };
    // A piece launched sideways is at its top, so 3.2% settled, and its sway
    // adds up to 0.032 * 0.15 * 1.2 * 300 = 1.7 px/s to the launch.
    const sway = 2;
    const right = simulate(confetti, { ...config, angle: 0, spread: 0 });
    for (const [i, vx] of field(right, 'vx').entries()) {
      expect(vx).toBeGreaterThanOrEqual(500 - sway);
      expect(vx).toBeLessThanOrEqual(1500 + sway);
      expect(Math.abs(field(right, 'vy')[i] ?? 0)).toBeLessThan(sway);
    }

    const up = simulate(confetti, { ...config, angle: 90, spread: 90 });
    const vy = field(up, 'vy');
    for (const [i, vx] of field(up, 'vx').entries()) {
      const degrees = (Math.atan2(-(vy[i] ?? 0), vx) * 180) / Math.PI;
      expect(degrees).toBeGreaterThan(45 - 5);
      expect(degrees).toBeLessThan(135 + 5);
    }
  });

  it('lives 85 to 100% of lifetime, so the burst ends by lifetime', () => {
    const simulation = simulate(confetti, { count: 200, lifetime: 2000 });
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
    const simulation = run(
      simulate(confetti, { count: 100, lifetime: 1000 }),
      0.6
    );
    expect(field(simulation, 'alpha').every((alpha) => alpha === 1)).toBe(true);
    run(simulation, 0.3);
    const alphas = field(simulation, 'alpha');
    expect(alphas.every((alpha) => alpha < 1)).toBe(true);
    expect(alphas.every((alpha) => alpha >= 0)).toBe(true);
  });

  it('flips: scaleY swings between -1 and 1', () => {
    const simulation = simulate(confetti, { count: 1 });
    const scales: number[] = [];
    for (let i = 0; i < 120; i++) {
      run(simulation, 1 / 60);
      scales.push(field(simulation, 'scaleY')[0] ?? 0);
    }
    expect(Math.min(...scales)).toBeLessThan(-0.95);
    expect(Math.max(...scales)).toBeGreaterThan(0.95);
  });

  it('flies all but unchanged while it rises (ADR 0059)', () => {
    const simulation = simulate(confetti, { count: 200 });
    // Measured: 0.00003 settled at most at the launch, and 1.9% at 0.3 s,
    // 0.64 px/s off its flight.
    for (const settled of field(simulation, 's2')) {
      expect(settled).toBeLessThan(1e-4);
    }
    const launch = field(simulation, 'vx');
    run(simulation, 0.3);
    for (const settled of field(simulation, 's2')) {
      expect(settled).toBeLessThan(0.025);
    }
    for (const [i, vx] of field(simulation, 'vx').entries()) {
      expect(Math.abs(vx - (launch[i] ?? 0) * Math.exp(-3 * 0.3))).toBeLessThan(
        1.5
      );
    }
  });

  it('eases into its fall from 0.4 s before its top to 1.6 s after', () => {
    const simulation = simulate(confetti, { count: 200 });
    const last = field(simulation, 's2');
    let step = 0;
    for (let i = 0; i < 144; i++) {
      run(simulation, 1 / 60);
      for (const [j, settled] of field(simulation, 's2').entries()) {
        step = Math.max(step, settled - (last[j] ?? 0));
        last[j] = settled;
      }
    }
    // Measured: no step settles a piece by more than 0.0248, the most an
    // ease over 2 s moves in 1/60 s, so nothing jumps.
    expect(step).toBeLessThan(0.026);
    // The last to top out does so at 0.72 s, so by 2.4 s all have settled.
    expect(last.every((settled) => settled === 1)).toBe(true);
  });

  it('falls at its own speed, 0.8 to 1.2 times gravity / drag', () => {
    const simulation = simulate(confetti, { count: 200 });
    for (const scale of field(simulation, 's3')) {
      expect(scale).toBeGreaterThanOrEqual(0.8);
      expect(scale).toBeLessThanOrEqual(1.2);
    }
    run(simulation, 2);
    // The swing speeds and slows each piece, and averages out over many.
    const fall = mean(field(simulation, 'vy'));
    expect(fall).toBeGreaterThan(300 * 0.9);
    expect(fall).toBeLessThan(300 * 1.1);
  });

  it('swings from side to side as a flutterer, and drifts as a tumbler', () => {
    const simulation = run(simulate(confetti, { count: 400 }), 1.25);
    const kinds = field(simulation, 's1');
    // Each piece's sideways speeds over the next second.
    const speeds = kinds.map((): number[] => []);
    for (let step = 0; step < 60; step++) {
      run(simulation, 1 / 60);
      for (const [i, vx] of field(simulation, 'vx').entries()) {
        speeds[i]?.push(vx);
      }
    }
    const pieces = kinds.map((kind, i) => ({ kind, vx: speeds[i] ?? [] }));
    const flutterers = pieces.filter(({ kind }) => Math.abs(kind) < 5);
    const tumblers = pieces.filter(({ kind }) => Math.abs(kind) > 7);
    const turns = flutterers.filter(
      ({ vx }) => Math.min(...vx) < 0 && Math.max(...vx) > 0
    );
    const keeps = tumblers.filter(
      ({ kind, vx }) => Math.sign(mean(vx)) === Math.sign(kind)
    );
    // Measured: 99% of the flutterers turn back, and every tumbler keeps to
    // its side.
    expect(turns.length / flutterers.length).toBeGreaterThan(0.9);
    expect(keeps.length / tumblers.length).toBeGreaterThan(0.9);
  });

  it('ends within 1 px at 30, 60 and 144 Hz after 1 s and 2.5 s', () => {
    // Measured, against 144 Hz: 0.62 px at 30 Hz and 0.13 px at 60 Hz after
    // 1 s, and 0.68 px and 0.15 px after 2.5 s, when every piece sways.
    for (const seconds of [1, 2.5]) {
      const at = (hz: number) =>
        run(simulate(confetti, { count: 100 }, 3), seconds, hz);
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

  it('tumbles and glides to either side at random', () => {
    const s1 = field(simulate(confetti, { count: 200 }), 's1');
    const left = s1.filter((speed) => speed < 0).length;
    expect(left).toBeGreaterThan(70);
    expect(left).toBeLessThan(130);
  });

  it('opens once it has fallen a while, instead of falling in a column', () => {
    const simulation = run(simulate(confetti, { count: 200 }), 1.25);
    const falling = width(simulation);
    run(simulation, 1.25);
    // Measured: 1.055 times as wide. Falling straight down, 1.024 times.
    expect(width(simulation)).toBeGreaterThan(falling * 1.04);
  });

  it('falls evenly, with no gap in the middle', () => {
    const simulation = run(simulate(confetti, { count: 2000 }), 2.5);
    // The middle 80% of the pieces, in five bands of equal width.
    const x = field(simulation, 'x').sort((a, b) => a - b);
    const from = x[Math.floor(0.1 * x.length)] ?? 0;
    const to = x[Math.floor(0.9 * x.length)] ?? 0;
    const bands = [0, 0, 0, 0, 0];
    for (const value of x) {
      const band = Math.floor(((value - from) / (to - from)) * 5);
      if (band >= 0 && band < 5) bands[band] = (bands[band] ?? 0) + 1;
    }
    // Measured: 1.02 times the mean band. Gliding to the side a piece was
    // thrown instead left 0.33 times, a gap between two columns.
    const mean = (0.8 * x.length) / 5;
    expect(bands[2]).toBeGreaterThan(0.8 * mean);
  });

  it('never settles without drag or gravity', () => {
    for (const still of [{ drag: 0 }, { gravity: 0 }]) {
      const simulation = simulate(confetti, { count: 50, ...still });
      const launch = field(simulation, 'vx');
      run(simulation, 2);
      expect(field(simulation, 's2').every((settled) => settled === 0)).toBe(
        true
      );
      const slowed = Math.exp(-(still.drag ?? 3) * 2);
      for (const [i, vx] of field(simulation, 'vx').entries()) {
        expect(vx).toBeCloseTo((launch[i] ?? 0) * slowed, 1);
      }
    }
  });

  it('matches its snapshot after half a second at 60 Hz', () => {
    const simulation = run(simulate(confetti, { count: 3 }), 0.5);
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
          "rotation": 4.922,
          "scaleY": 0.761,
          "vx": -21.122,
          "vy": 60.158,
          "x": -25.884,
          "y": -123.495,
        },
        {
          "alpha": 1,
          "rotation": 1.92,
          "scaleY": 0.642,
          "vx": -158.737,
          "vy": -85.483,
          "x": -183.856,
          "y": -262.655,
        },
        {
          "alpha": 1,
          "rotation": 3.386,
          "scaleY": -0.351,
          "vx": 46.856,
          "vy": -207.482,
          "x": 54.223,
          "y": -422.926,
        },
      ]
    `);
  });
});
