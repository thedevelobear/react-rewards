import { describe, expect, it } from '@rstest/core';
import {
  defineEffect,
  type EffectDefinition,
  resolveConfig,
} from '@/core/define-effect';
import { createLoop, type FrameScheduler } from '@/core/loop';
import { accelerate, degToRad } from '@/core/math';
import { createSimulation, type Simulation } from '@/core/simulation';

const origin = { x: 100, y: 200 };

type TestConfig = { count: number; lifetime: number };

const testEffect = (overrides: Partial<EffectDefinition<TestConfig>> = {}) =>
  defineEffect<TestConfig>({
    name: 'test',
    blend: 'normal',
    defaults: { count: 3, lifetime: 1000 },
    sprites: () => [{ shape: 'rect', color: '#000', width: 4, height: 4 }],
    spawn: () => {},
    update: () => {},
    ...overrides,
  });

const particles = (simulation: Simulation) =>
  Array.from({ length: simulation.pool.count }, (_, i) => ({
    x: simulation.pool.fields.x[i] ?? Number.NaN,
    y: simulation.pool.fields.y[i] ?? Number.NaN,
    age: simulation.pool.fields.age[i] ?? Number.NaN,
  }));

describe('createSimulation', () => {
  it('spawns count particles at the origin, in index order', () => {
    const indices: number[] = [];
    const effect = testEffect({
      spawn: (p, _config, _rng, index) => {
        indices.push(index);
        expect(p.x).toBe(origin.x);
        expect(p.y).toBe(origin.y);
        expect(p.life).toBe(1);
        p.vx = index;
      },
    });
    const simulation = createSimulation(effect, resolveConfig(effect), {
      origin,
    });
    expect(indices).toEqual([0, 1, 2]);
    expect(simulation.pool.count).toBe(3);
    expect(Array.from(simulation.pool.fields.vx.subarray(0, 3))).toEqual([
      0, 1, 2,
    ]);
    expect(simulation.done).toBe(false);
  });

  it('is done at once when count is 0, and floors fractional counts', () => {
    const effect = testEffect();
    expect(
      createSimulation(effect, { count: 0, lifetime: 1 }, { origin }).done
    ).toBe(true);
    expect(
      createSimulation(effect, { count: -4, lifetime: 1 }, { origin }).done
    ).toBe(true);
    expect(
      createSimulation(effect, { count: 2.9, lifetime: 1 }, { origin }).pool
        .count
    ).toBe(2);
  });

  it('ages particles before update, so update sees the new age', () => {
    const ages: number[] = [];
    const effect = testEffect({
      defaults: { count: 1, lifetime: 1000 },
      update: (p) => {
        ages.push(p.age);
      },
    });
    const simulation = createSimulation(effect, resolveConfig(effect), {
      origin,
    });
    simulation.step(0.25);
    simulation.step(0.25);
    expect(ages).toEqual([0.25, 0.5]);
  });

  it('moves particles by their velocity', () => {
    const effect = testEffect({
      defaults: { count: 1, lifetime: 10_000 },
      spawn: (p) => {
        p.vx = 30;
        p.vy = -60;
      },
    });
    const simulation = createSimulation(effect, resolveConfig(effect), {
      origin,
    });
    for (let i = 0; i < 10; i++) simulation.step(0.1);
    const [p] = particles(simulation);
    expect(p?.x).toBeCloseTo(origin.x + 30, 3);
    expect(p?.y).toBeCloseTo(origin.y - 60, 3);
  });

  it('makes constant acceleration exact at any step size', () => {
    const fall = (steps: number): number => {
      const effect = testEffect({
        defaults: { count: 1, lifetime: 10_000 },
        update: (p, dt) => {
          p.vy += 900 * dt;
        },
      });
      const simulation = createSimulation(effect, resolveConfig(effect), {
        origin,
      });
      for (let i = 0; i < steps; i++) simulation.step(1 / steps);
      return particles(simulation)[0]?.y ?? Number.NaN;
    };
    // y = ½ g t² after 1 s, whether in 2, 30 or 144 steps.
    expect(fall(2)).toBeCloseTo(origin.y + 450, 2);
    expect(fall(30)).toBeCloseTo(origin.y + 450, 2);
    expect(fall(144)).toBeCloseTo(origin.y + 450, 2);
  });

  it('removes particles once their age reaches their life', () => {
    const effect = testEffect({
      spawn: (p, _config, _rng, index) => {
        p.life = (index + 1) * 0.1;
      },
    });
    const simulation = createSimulation(effect, resolveConfig(effect), {
      origin,
    });
    const counts: number[] = [];
    for (let i = 0; i < 4; i++) {
      simulation.step(0.1);
      counts.push(simulation.pool.count);
    }
    expect(counts).toEqual([2, 1, 0, 0]);
    expect(simulation.done).toBe(true);
  });

  it('keeps the right particles when one is removed mid-step', () => {
    const effect = testEffect({
      defaults: { count: 4, lifetime: 1000 },
      spawn: (p, _config, _rng, index) => {
        p.s0 = index;
        if (index === 1) p.life = 0.05;
      },
      update: (p) => {
        p.s1 += 1;
      },
    });
    const simulation = createSimulation(effect, resolveConfig(effect), {
      origin,
    });
    simulation.step(0.1);
    const { s0, s1 } = simulation.pool.fields;
    expect(Array.from(s0.subarray(0, 3)).sort()).toEqual([0, 2, 3]);
    // Every survivor was updated exactly once.
    expect(Array.from(s1.subarray(0, 3))).toEqual([1, 1, 1]);
  });

  it('lets update spawn children at the parent, first updated next step', () => {
    const effect = testEffect({
      defaults: { count: 1, lifetime: 10_000 },
      spawn: (p) => {
        p.vx = 100;
      },
      update: (p, _dt, _config, ctx) => {
        p.s1 += 1;
        if (p.s0 === 0 && p.age < 0.15) {
          ctx.spawn((child) => {
            child.s0 = 1;
            child.life = 5;
          });
        }
      },
    });
    const simulation = createSimulation(effect, resolveConfig(effect), {
      origin,
    });
    simulation.step(0.1);
    const { fields } = simulation.pool;
    expect(simulation.pool.count).toBe(2);
    // The child starts where the parent was when update ran, not updated yet.
    expect(fields.x[1]).toBe(origin.x);
    expect(fields.s0[1]).toBe(1);
    expect(fields.s1[1]).toBe(0);
    expect(fields.life[1]).toBe(5);

    simulation.step(0.1);
    expect(fields.s1[1]).toBe(1);
  });

  it('survives children growing the pool mid-step', () => {
    const effect = testEffect({
      defaults: { count: 2, lifetime: 10_000 },
      spawn: (p) => {
        p.vx = 10;
      },
      update: (p, _dt, _config, ctx) => {
        if (p.s0 === 0) {
          for (let i = 0; i < 50; i++) ctx.spawn((child) => (child.s0 = 1));
        }
        p.s0 = 2;
      },
    });
    const simulation = createSimulation(effect, resolveConfig(effect), {
      origin,
    });
    simulation.step(0.5);
    expect(simulation.pool.count).toBe(102);
    // Both parents still moved, even though the arrays were replaced.
    const { x, s0 } = simulation.pool.fields;
    const parents = Array.from({ length: 102 }, (_, i) => i).filter(
      (i) => s0[i] === 2
    );
    expect(parents.map((i) => x[i])).toEqual([origin.x + 5, origin.x + 5]);
  });

  it('repeats exactly for the same seed', () => {
    const effect = testEffect({
      defaults: { count: 20, lifetime: 2000 },
      spawn: (p, _config, rng) => {
        p.vx = rng.range(-300, 300);
        p.vy = rng.range(-600, -200);
      },
      update: (p, dt, _config, ctx) => {
        p.vy += 900 * dt;
        p.rotation += ctx.rng.range(-1, 1) * dt;
      },
    });
    const run = (seed: number): number[] => {
      const simulation = createSimulation(effect, resolveConfig(effect), {
        origin,
        seed,
      });
      for (let i = 0; i < 60; i++) simulation.step(1 / 60);
      const { x, y, rotation } = simulation.pool.fields;
      return [...x, ...y, ...rotation];
    };
    expect(run(9)).toEqual(run(9));
    expect(run(9)).not.toEqual(run(10));
  });
});

describe('frame-rate independence', () => {
  type FallConfig = {
    count: number;
    lifetime: number;
    gravity: number;
    drag: number;
  };

  const falling = defineEffect<FallConfig>({
    name: 'falling',
    blend: 'normal',
    defaults: { count: 50, lifetime: 5000, gravity: 900, drag: 1.5 },
    sprites: () => [{ shape: 'rect', color: '#000', width: 4, height: 4 }],
    spawn: (p, _config, rng) => {
      const angle = degToRad(90 + rng.range(-45, 45));
      const speed = rng.range(300, 900);
      p.vx = Math.cos(angle) * speed;
      p.vy = -Math.sin(angle) * speed;
    },
    update: (p, dt, config) => {
      p.vx = accelerate(p.vx, 0, config.drag, dt);
      p.vy = accelerate(p.vy, config.gravity, config.drag, dt);
    },
  });

  /** Runs one second of frames at `hz` through the real loop. */
  const runAt = (hz: number) => {
    let pending: ((time: number) => void) | undefined;
    const scheduler: FrameScheduler = {
      request: (callback) => {
        pending = callback;
        return 1;
      },
      cancel: () => {
        pending = undefined;
      },
    };
    const simulation = createSimulation(falling, resolveConfig(falling), {
      origin,
      seed: 1234,
    });
    const remove = createLoop(scheduler).add((dt) => simulation.step(dt));
    // Frame 0 has dt 0, then `hz` frames of 1/hz s each.
    for (let frame = 0; frame <= hz; frame++) {
      const callback = pending;
      pending = undefined;
      callback?.((frame * 1000) / hz);
    }
    remove();
    return particles(simulation);
  };

  it('ends 1 s at 30, 60 and 144 Hz within 0.5 px of each other', () => {
    const reference = runAt(144);
    expect(reference).toHaveLength(50);
    expect(reference.every((p) => p.age > 0.99 && p.age < 1.01)).toBe(true);

    for (const hz of [30, 60]) {
      const result = runAt(hz);
      const drift = result.map((p, i) =>
        Math.hypot(p.x - (reference[i]?.x ?? 0), p.y - (reference[i]?.y ?? 0))
      );
      expect(Math.max(...drift)).toBeLessThan(0.5);
    }
  });
});
