import type { FIELDS } from './store';

/** The name of a per-particle field. */
export type Field = (typeof FIELDS)[number];

/**
 * A structure-of-arrays particle store. Live particles occupy indices 0 to
 * `count - 1`, with no gaps.
 */
export interface Pool {
  readonly count: number;
  /** How many particles fit before the arrays grow. */
  readonly capacity: number;
  /**
   * One array per field, `capacity` long. Growing replaces the arrays, so
   * read them from here each time rather than keeping a reference.
   */
  readonly fields: Readonly<Record<Field, Float32Array>>;
  /** Adds a particle with default fields and returns its index. */
  alloc(): number;
  /** Removes the particle at `index` by moving the last one into its place. */
  free(index: number): void;
  /** Removes every particle. */
  clear(): void;
}
