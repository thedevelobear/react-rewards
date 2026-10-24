import type { Point } from '@/core/math';

/** Anything with a layout box, such as a DOM element. */
export interface Measurable {
  getBoundingClientRect(): {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

/** A React-style ref to an element. */
export interface TargetRef {
  readonly current: Measurable | null;
}

/**
 * Where a burst starts: a point in viewport CSS pixels (such as a pointer
 * position), an element, or a ref to an element.
 */
export type Origin = Point | Measurable | TargetRef;
