import type { Effect, EffectConfig, UpdateContext } from '@/core/define-effect';
import { createRng, type Rng } from '@/core/math';
import { createPool, type Pool } from '@/core/pool';
import { ParticleView } from './view';

export interface Point {
  x: number;
  y: number;
}

export interface SimulationOptions {
  /** Where particles spawn, in viewport CSS pixels. */
  readonly origin: Point;
  /** Seeds the burst's generator. Random when left out. */
  readonly seed?: number;
}

/** One burst's particles, stepped with its effect. */
export interface Simulation {
  readonly pool: Pool;
  readonly rng: Rng;
  /** True once every particle has been removed. */
  readonly done: boolean;
  /** Advances every particle by `dt` seconds. */
  step(dt: number): void;
}

/**
 * Spawns `config.count` particles at the origin and runs `spawn` on each.
 * Each `step` then ages every particle, runs `update`, moves the particle by
 * the average of its velocity before and after `update`, and removes it once
 * its age reaches its life (ADR 0019).
 */
export const createSimulation = <C extends EffectConfig>(
  effect: Effect<C>,
  config: C,
  options: SimulationOptions
): Simulation => {
  const rng = createRng(options.seed);
  const count = Math.max(0, Math.floor(config.count));
  const life = config.lifetime / 1000;
  const pool = createPool(count);
  // The record is stable. The arrays in it are replaced when the pool grows,
  // so they are read from it on every access.
  const { fields } = pool;
  const current = new ParticleView(pool);
  const child = new ParticleView(pool);

  const add = (x: number, y: number): number => {
    const index = pool.alloc();
    fields.x[index] = x;
    fields.y[index] = y;
    fields.life[index] = life;
    return index;
  };

  const context: UpdateContext = {
    rng,
    spawn: (init) => {
      child.index = add(current.x, current.y);
      init(child);
    },
  };

  for (let i = 0; i < count; i++) {
    current.index = add(options.origin.x, options.origin.y);
    effect.spawn(current, config, rng, i);
  }

  return {
    pool,
    rng,
    get done() {
      return pool.count === 0;
    },
    step: (dt) => {
      // Backwards, so removing a particle (which moves the last one into its
      // place) never skips one. Children are appended past the start index,
      // so they are first updated on the next step.
      for (let i = pool.count - 1; i >= 0; i--) {
        fields.age[i] = (fields.age[i] ?? 0) + dt;
        const vx = fields.vx[i] ?? 0;
        const vy = fields.vy[i] ?? 0;

        current.index = i;
        effect.update(current, dt, config, context);

        fields.x[i] =
          (fields.x[i] ?? 0) + ((vx + (fields.vx[i] ?? 0)) / 2) * dt;
        fields.y[i] =
          (fields.y[i] ?? 0) + ((vy + (fields.vy[i] ?? 0)) / 2) * dt;
        // Both sides as stored (float32), so a life of 0.1 s ends after one
        // 0.1 s step rather than two.
        if ((fields.age[i] ?? 0) >= (fields.life[i] ?? 0)) pool.free(i);
      }
    },
  };
};
