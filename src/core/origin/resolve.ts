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

const centre = (target: Measurable): Point => {
  const box = target.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

/**
 * The viewport position a burst starts at: a point as given, or the centre
 * of an element or a ref's element. Undefined when the ref is empty.
 */
export const resolveOrigin = (origin: Origin): Point | undefined => {
  if ('getBoundingClientRect' in origin) return centre(origin);
  if ('current' in origin) {
    return origin.current ? centre(origin.current) : undefined;
  }
  return { x: origin.x, y: origin.y };
};
