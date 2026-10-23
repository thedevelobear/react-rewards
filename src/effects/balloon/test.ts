import { describe, expect, it } from '@rstest/core';
import { resolveConfig } from '@/core/define-effect';
import { createSimulation, type Simulation } from '@/core/simulation';
import { type BalloonConfig, balloon } from '@/effects/balloon';

const origin = { x: 0, y: 0 };

const simulate = (overrides: Partial<BalloonConfig> = {}, seed = 1) =>
  createSimulation(balloon, resolveConfig(balloon, overrides), {
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

describe('balloon', () => {
  it('has the defaults of ADR 0039, frozen', () => {
    expect(balloon.defaults).toEqual({
      count: 10,
      size: 20,
      colors: ['#A45BF1', '#25C6F6', '#72F753', '#F76C88', '#F5F770'],
      angle: 90,
      spread: 60,
      velocity: 600,
      drag: 2,
      gravity: -300,
      lifetime: 5000,
    });
    expect(Object.isFrozen(balloon.defaults)).toBe(true);
    expect(balloon.blend).toBe('normal');
  });

  it('draws one SVG per colour, with the colour baked in', () => {
    const config = resolveConfig(balloon, {
      size: 40,
      colors: ['#123456', 'red'],
    });
    const sprites = balloon.sprites(config);
    expect(sprites).toHaveLength(2);
    for (const [i, color] of ['#123456', 'red'].entries()) {
      const sprite = sprites[i];
      if (!sprite || !('svg' in sprite)) throw new Error('Not an SVG sprite.');
      expect(sprite.width).toBe(40);
      expect(sprite.height).toBeCloseTo((40 * 3040) / 976, 6);
      expect(sprite.svg).toMatch(/^<svg width="976" height="3040" /);
      expect(sprite.svg).not.toContain('currentColor');
      expect(sprite.svg.split(`fill="${color}"`)).toHaveLength(4);
    }
  });

  it('spawns count balloons, each with one of the colours', () => {
    const simulation = simulate({ count: 200 });
    const sprites = field(simulation, 'sprite');
    expect(sprites).toHaveLength(200);
    expect(new Set(sprites)).toEqual(new Set([0, 1, 2, 3, 4]));
  });

  it('launches within the cone, at 0.5 to 1.5 times velocity', () => {
    const config = { count: 200, size: 20, velocity: 1000 };
    // The sway adds at most 20 * 2 = 40 px/s across the launch.
    const sway = 40;
    const up = simulate({ ...config, angle: 90, spread: 0 });
    for (const [i, vy] of field(up, 'vy').entries()) {
      expect(-vy).toBeGreaterThanOrEqual(500);
      expect(-vy).toBeLessThanOrEqual(1500);
      expect(Math.abs(field(up, 'vx')[i] ?? 0)).toBeLessThanOrEqual(sway);
    }

    const right = simulate({ ...config, angle: 0, spread: 60 });
    const vy = field(right, 'vy');
    for (const [i, vx] of field(right, 'vx').entries()) {
      const degrees = (Math.atan2(-(vy[i] ?? 0), vx) * 180) / Math.PI;
      expect(degrees).toBeGreaterThan(-30 - 5);
      expect(degrees).toBeLessThan(30 + 5);
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

  it('rises at 0.8 to 1.2 times -gravity / drag', () => {
    // At 3 s the launch has slowed to under 1 px/s. The rest is buoyancy:
    // 0.8 to 1.2 times 300 / 2 = 150 px/s.
    const simulation = run(simulate({ count: 200 }), 3);
    const rises = field(simulation, 'vy').map((vy) => -vy);
    for (const rise of rises) {
      expect(rise).toBeGreaterThan(120 - 1);
      expect(rise).toBeLessThan(180 + 1);
    }
    expect(Math.max(...rises) - Math.min(...rises)).toBeGreaterThan(40);
  });

  it('falls with a positive gravity', () => {
    const simulation = run(simulate({ count: 50, gravity: 300 }), 3);
    expect(field(simulation, 'vy').every((vy) => vy > 0)).toBe(true);
  });

  it('sways by up to size, and tilts with the sway', () => {
    // With no launch, the only sideways motion is the sway.
    const simulation = simulate({ count: 20, velocity: 0, size: 20 });
    const start = field(simulation, 'x');
    let turned = false;
    let widest = 0;
    let steepest = 0;
    for (let i = 0; i < 4 * 60; i++) {
      run(simulation, 1 / 60);
      const rotation = field(simulation, 'rotation');
      for (const [j, vx] of field(simulation, 'vx').entries()) {
        const tilt = rotation[j] ?? 0;
        // Leaning right while moving right, so the string trails left. The
        // pool's float32 rounding leaves the launch a hair above 0, so the
        // signs are compared only away from the turns.
        if (Math.abs(vx) > 0.1) expect(Math.sign(tilt)).toBe(Math.sign(vx));
        turned ||= vx < 0;
        steepest = Math.max(steepest, Math.abs(tilt));
        widest = Math.max(
          widest,
          Math.abs((field(simulation, 'x')[j] ?? 0) - (start[j] ?? 0))
        );
      }
    }
    expect(turned).toBe(true);
    expect(steepest).toBeGreaterThan(0.19);
    expect(steepest).toBeLessThanOrEqual(0.2 + 1e-6);
    // From one side of the sway to the other is at most 2 * size.
    expect(widest).toBeGreaterThan(20);
    expect(widest).toBeLessThanOrEqual(40 + 0.5);
  });

  it('keeps a scale of 0.9 to 1.1', () => {
    const simulation = simulate({ count: 100 });
    const scales = field(simulation, 'scale');
    for (const scale of scales) {
      expect(scale).toBeGreaterThanOrEqual(0.9 - 1e-6);
      expect(scale).toBeLessThanOrEqual(1.1 + 1e-6);
    }
    run(simulation, 2);
    expect(field(simulation, 'scale')).toEqual(scales);
  });

  it('stays opaque until the last 20% of its life, then fades', () => {
    const simulation = run(simulate({ count: 100, lifetime: 1000 }), 0.6);
    expect(field(simulation, 'alpha').every((alpha) => alpha === 1)).toBe(true);
    run(simulation, 0.3);
    const alphas = field(simulation, 'alpha');
    expect(alphas.every((alpha) => alpha < 1)).toBe(true);
    expect(alphas.every((alpha) => alpha >= 0)).toBe(true);
  });

  it('ends within 1 px at 30, 60 and 144 Hz after 1 s', () => {
    // Measured: 0.12 px at 30 Hz and 0.03 px at 60 Hz, against 144 Hz.
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
          "rotation": -0,
          "scale": 1.094,
          "sprite": 2,
          "vx": -14.773,
          "vy": -196.503,
          "x": -19.629,
          "y": -119.674,
        },
        {
          "alpha": 1,
          "rotation": -0.107,
          "scale": 0.928,
          "sprite": 2,
          "vx": 13.315,
          "vy": -420.121,
          "x": 18.937,
          "y": -309.168,
        },
        {
          "alpha": 1,
          "rotation": 0.111,
          "scale": 0.957,
          "sprite": 1,
          "vx": 17.274,
          "vy": -208.32,
          "x": 12.552,
          "y": -131.772,
        },
      ]
    `);
  });
});
