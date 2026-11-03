import type { ElementAnimation } from '@/core/define-effect';
import type { Measurable, Origin, TargetRef } from '@/core/origin';
import type { Animatable } from './types';

/**
 * The element a burst animates: `element` if given, otherwise `origin` when
 * that is an element or a ref, read through the ref now. Undefined for a
 * point or an empty ref.
 */
export const resolveElement = (
  origin: Origin,
  element: Measurable | TargetRef | undefined
): object | undefined => {
  const target =
    element ??
    ('getBoundingClientRect' in origin || 'current' in origin
      ? origin
      : undefined);
  if (!target) return undefined;
  return 'getBoundingClientRect' in target
    ? target
    : (target.current ?? undefined);
};

const animatable = (element: object): element is Animatable =>
  typeof (element as Partial<Animatable>).animate === 'function';

/**
 * Plays `motion` on `element` with the Web Animations API, added to the
 * element's own styles (`composite: 'add'`). It restarts rather than stacks:
 * the animation an earlier burst started on the element, kept in `playing`,
 * is cancelled first. Returns a function that cancels this one and puts the
 * element back, unless a later burst has restarted it since. Does nothing
 * where the element can't animate, or rejects the animation.
 */
export const playOn = (
  element: object,
  motion: ElementAnimation,
  playing: WeakMap<object, Animation>
): (() => void) | undefined => {
  if (!animatable(element)) return undefined;
  let animation: Animation;
  try {
    playing.get(element)?.cancel();
    animation = element.animate([...motion.keyframes], {
      duration: motion.duration,
      easing: motion.easing ?? 'linear',
      composite: 'add',
    });
  } catch {
    return undefined;
  }
  playing.set(element, animation);
  return () => {
    if (playing.get(element) !== animation) return;
    playing.delete(element);
    animation.cancel();
  };
};
