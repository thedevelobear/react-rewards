import type { BlendMode } from '@/core/define-effect';
import type { Batch } from '@/core/renderer';

/** Particles drawn with one call: neighbouring batches with one blend mode. */
export interface Run {
  blend: BlendMode;
  /** The run's first particle in the instance buffer. */
  start: number;
  count: number;
}

export interface Instances {
  /** `INSTANCE_FLOATS` per particle. It is replaced by a larger array when full. */
  readonly data: Float32Array;
  /** How many particles the last `write` packed. */
  readonly count: number;
  /** The runs of the last `write`, in batch order (ADR 0034). */
  readonly runs: readonly Run[];
  /** Packs the visible particles of a frame's batches, in order. */
  write(batches: readonly Batch[]): void;
}
