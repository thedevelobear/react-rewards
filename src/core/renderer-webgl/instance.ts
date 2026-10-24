import type { BlendMode } from '@/core/define-effect';
import type { Batch } from '@/core/renderer';

/**
 * Floats per particle in the instance buffer: the centre in CSS pixels and
 * the alpha; the 2x2 matrix from atlas texels to CSS pixels, column by
 * column; and the sprite's box in the atlas (x, y, width, height in texels).
 */
export const INSTANCE_FLOATS = 11;

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

/**
 * Creates the per-particle data for instanced drawing. It skips the same
 * particles the Canvas 2D renderer skips: invisible, zero-sized, or with no
 * sprite. The arrays and runs are reused, so writing a frame allocates
 * nothing once the buffer is large enough.
 */
export const createInstances = (initialCapacity = 256): Instances => {
  let data = new Float32Array(
    Math.max(1, Math.floor(initialCapacity)) * INSTANCE_FLOATS
  );
  let count = 0;
  const runs: Run[] = [];
  const spare: Run[] = [];

  /** Makes room for `needed` particles, keeping the ones already packed. */
  const reserve = (needed: number): void => {
    if (needed * INSTANCE_FLOATS <= data.length) return;
    let capacity = data.length / INSTANCE_FLOATS;
    while (capacity < needed) capacity *= 2;
    const next = new Float32Array(capacity * INSTANCE_FLOATS);
    next.set(data.subarray(0, count * INSTANCE_FLOATS));
    data = next;
  };

  const write = (batches: readonly Batch[]): void => {
    count = 0;
    runs.length = 0;
    for (const { pool, regions, blend } of batches) {
      reserve(count + pool.count);
      const start = count;
      const { x, y, rotation, scale, scaleX, scaleY, alpha, sprite } =
        pool.fields;
      for (let i = 0; i < pool.count; i++) {
        const opacity = alpha[i] ?? 0;
        const region = regions[(sprite[i] ?? 0) | 0];
        if (opacity <= 0 || !region || region.sw === 0 || region.sh === 0) {
          continue;
        }
        const size = scale[i] ?? 0;
        const kx = size * (scaleX[i] ?? 0);
        const ky = size * (scaleY[i] ?? 0);
        if (kx === 0 || ky === 0) continue;
        // CSS pixels per atlas texel, before rotation.
        const ux = (kx * region.width) / region.sw;
        const uy = (ky * region.height) / region.sh;
        const angle = rotation[i] ?? 0;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const o = count * INSTANCE_FLOATS;
        data[o] = x[i] ?? 0;
        data[o + 1] = y[i] ?? 0;
        data[o + 2] = Math.min(opacity, 1);
        data[o + 3] = cos * ux;
        data[o + 4] = sin * ux;
        data[o + 5] = -sin * uy;
        data[o + 6] = cos * uy;
        data[o + 7] = region.sx;
        data[o + 8] = region.sy;
        data[o + 9] = region.sw;
        data[o + 10] = region.sh;
        count += 1;
      }
      const written = count - start;
      if (written === 0) continue;
      const last = runs[runs.length - 1];
      if (last?.blend === blend) {
        last.count += written;
        continue;
      }
      let run = spare[runs.length];
      if (!run) {
        run = { blend, start, count: 0 };
        spare.push(run);
      }
      run.blend = blend;
      run.start = start;
      run.count = written;
      runs.push(run);
    }
  };

  return {
    get data() {
      return data;
    },
    get count() {
      return count;
    },
    runs,
    write,
  };
};
