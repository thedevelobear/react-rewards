import { describe, expect, it } from '@rstest/core';
import { resolveConfig } from '@/core/define-effect';
import { createSimulation, type Simulation } from '@/core/simulation';
import { type EmojiConfig, emoji } from '@/effects/emoji';

const origin = { x: 0, y: 0 };

const simulate = (overrides: Partial<EmojiConfig> = {}, seed = 1) =>
  createSimulation(emoji, resolveConfig(emoji, overrides), {
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

const DEGREE = Math.PI / 180;

describe('emoji', () => {
  it('has the defaults of ADR 0038, frozen', () => {
    expect(emoji.defaults).toEqual({
      count: 20,
      size: 25,
      emojis: ['🤓', '😊', '🥳'],
      angle: 90,
      spread: 45,
      velocity: 1500,
      drag: 3,
      gravity: 900,
      lifetime: 3000,
      rotate: true,
    });
    expect(Object.isFrozen(emoji.defaults)).toBe(true);
    expect(emoji.blend).toBe('normal');
  });

  it('draws one sprite per emoji, at size', () => {
    const config = resolveConfig(emoji, { size: 30, emojis: ['🎉', '✨'] });
    expect(emoji.sprites(config)).toEqual([
      { emoji: '🎉', size: 30 },
      { emoji: '✨', size: 30 },
    ]);
  });

  it('spawns count emoji, taking the emojis in turn', () => {
    const simulation = simulate({ count: 7 });
    expect(field(simulation, 'sprite')).toEqual([0, 1, 2, 0, 1, 2, 0]);
  });

  it('launches within the cone, at 0.5 to 1.5 times velocity', () => {
    const config = { count: 200, velocity: 1000 };
    const right = simulate({ ...config, angle: 0, spread: 0 });
    for (const [i, vx] of field(right, 'vx').entries()) {
      expect(vx).toBeGreaterThanOrEqual(500);
      expect(vx).toBeLessThanOrEqual(1500);
      expect(Math.abs(field(right, 'vy')[i] ?? 0)).toBeLessThan(1e-3);
    }

    const up = simulate({ ...config, angle: 90, spread: 90 });
    const vy = field(up, 'vy');
    for (const [i, vx] of field(up, 'vx').entries()) {
      const degrees = Math.atan2(-(vy[i] ?? 0), vx) / DEGREE;
      expect(degrees).toBeGreaterThanOrEqual(45 - 1e-3);
      expect(degrees).toBeLessThanOrEqual(135 + 1e-3);
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

  it('pops in from nothing to 0.9 to 1.1 times size in 0.15 s', () => {
    const simulation = simulate({ count: 100 });
    expect(field(simulation, 'scale').every((scale) => scale === 0)).toBe(true);

    run(simulation, 0.05);
    const growing = field(simulation, 'scale');
    run(simulation, 0.1);
    const full = field(simulation, 'scale');
    for (const [i, scale] of full.entries()) {
      expect(growing[i]).toBeGreaterThan(0);
      expect(growing[i]).toBeLessThan(scale);
      expect(scale).toBeGreaterThanOrEqual(0.9 - 1e-6);
      expect(scale).toBeLessThanOrEqual(1.1 + 1e-6);
    }
    run(simulation, 1);
    expect(field(simulation, 'scale')).toEqual(full);
  });

  it('with rotate, starts within 15 degrees of upright and spins gently', () => {
    const simulation = simulate({ count: 200 });
    const start = field(simulation, 'rotation');
    for (const rotation of start) {
      expect(Math.abs(rotation)).toBeLessThanOrEqual(15 * DEGREE + 1e-6);
    }
    run(simulation, 1);
    const spins = field(simulation, 'rotation').map(
      (rotation, i) => rotation - (start[i] ?? 0)
    );
    for (const spin of spins) {
      expect(Math.abs(spin)).toBeGreaterThanOrEqual(0.5 - 1e-4);
      expect(Math.abs(spin)).toBeLessThanOrEqual(2 + 1e-4);
    }
    expect(spins.some((spin) => spin < 0)).toBe(true);
    expect(spins.some((spin) => spin > 0)).toBe(true);
  });

  it('without rotate, stays upright on the same flight', () => {
    const turning = run(simulate({ count: 50 }), 1);
    const upright = run(simulate({ count: 50, rotate: false }), 1);
    expect(field(upright, 'rotation').every((rotation) => rotation === 0)).toBe(
      true
    );
    expect(field(upright, 'x')).toEqual(field(turning, 'x'));
    expect(field(upright, 'y')).toEqual(field(turning, 'y'));
  });

  it('stays opaque until the last 20% of its life, then fades', () => {
    const simulation = run(simulate({ count: 100, lifetime: 1000 }), 0.6);
    expect(field(simulation, 'alpha').every((alpha) => alpha === 1)).toBe(true);
    run(simulation, 0.3);
    const alphas = field(simulation, 'alpha');
    expect(alphas.every((alpha) => alpha < 1)).toBe(true);
    expect(alphas.every((alpha) => alpha >= 0)).toBe(true);
  });

  it('rises, then falls at about gravity / drag', () => {
    const simulation = run(simulate({ count: 100 }), 0.3);
    const mean = (values: number[]) =>
      values.reduce((sum, value) => sum + value, 0) / values.length;
    expect(mean(field(simulation, 'y'))).toBeLessThan(-200);

    run(simulation, 1.7);
    // At 2 s every emoji has slowed to near 900 / 3 = 300 px/s.
    for (const vy of field(simulation, 'vy')) {
      expect(vy).toBeGreaterThan(300 - 20);
      expect(vy).toBeLessThan(300 + 20);
    }
  });

  it('ends within 1 px at 30, 60 and 144 Hz after 1 s', () => {
    // Measured: 0.64 px at 30 Hz and 0.14 px at 60 Hz, against 144 Hz.
    const at = (hz: number) => run(simulate({ count: 100 }, 3), 1, hz);
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
  });

  it('matches its snapshot after half a second at 60 Hz', () => {
    const simulation = run(simulate({ count: 3 }), 0.5);
    const round = (value: number) => Math.round(value * 1000) / 1000;
    const state = Array.from({ length: simulation.pool.count }, (_, i) =>
      Object.fromEntries(
        (
          [
            'x',
            'y',
            'vx',
            'vy',
            'rotation',
            'scale',
            'alpha',
            'sprite',
          ] as const
        ).map((name) => [name, round(field(simulation, name)[i] ?? Number.NaN)])
      )
    );
    expect(state).toMatchInlineSnapshot(`
      [
        {
          "alpha": 1,
          "rotation": 0.706,
          "scale": 1.096,
          "sprite": 0,
          "vx": -16.765,
          "vy": 65.635,
          "x": -19.461,
          "y": -122.052,
        },
        {
          "alpha": 1,
          "rotation": -0.36,
          "scale": 0.991,
          "sprite": 1,
          "vx": -53.452,
          "vy": -72.154,
          "x": -62.047,
          "y": -281.998,
        },
        {
          "alpha": 1,
          "rotation": -0.881,
          "scale": 0.913,
          "sprite": 2,
          "vx": 43.153,
          "vy": 18.298,
          "x": 50.093,
          "y": -177.001,
        },
      ]
    `);
  });
});
