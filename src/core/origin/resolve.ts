import type { Point } from '@/core/math';
import type { Measurable, Origin } from './types';

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
