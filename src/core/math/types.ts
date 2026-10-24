/** Maps progress in [0, 1] to eased progress. f(0) is 0 and f(1) is 1. */
export type Easing = (t: number) => number;

/** A position in CSS pixels. */
export interface Point {
  x: number;
  y: number;
}

/** A seedable pseudo-random number generator. */
export interface Rng {
  /** The seed this generator started from. */
  readonly seed: number;
  /** A float in [0, 1). */
  next(): number;
  /** A float in [min, max). */
  range(min: number, max: number): number;
  /** An integer in [min, max). */
  int(min: number, max: number): number;
  /** One of `items`, chosen uniformly. Throws on an empty list. */
  pick<T>(items: readonly T[]): T;
}
