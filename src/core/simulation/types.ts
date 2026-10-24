import type { Point, Rng } from '@/core/math';
import type { Pool } from '@/core/pool';

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
