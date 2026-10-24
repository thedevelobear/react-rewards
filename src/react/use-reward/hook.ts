import {
  useCallback,
  useEffect,
  useInsertionEffect,
  useRef,
  useState,
} from 'react';
import type { ConfigOf, Effect } from '@/core/define-effect';
import { type Burst, fire } from '@/core/fire';
import type { Origin } from '@/core/origin';
import type {
  PositionedEvent,
  RewardOptions,
  RewardTarget,
  UseRewardResult,
} from './types';

const finite = (value: unknown): value is number => Number.isFinite(value);

/**
 * Where a reward starts. An event with a pointer position, such as the click
 * when `reward` is the handler, starts at the pointer. A click from the
 * keyboard or `element.click()` has `detail` 0 and no real position, so it
 * starts at the target, as does anything else that isn't an origin. The
 * checks run on what JavaScript callers pass too (ADR 0044).
 */
const startOf = (
  arg: Origin | PositionedEvent | undefined,
  target: RewardTarget
): Origin => {
  if (typeof arg !== 'object' || arg === null) return target;
  if ('clientX' in arg) {
    const keyboard = arg.type === 'click' && arg.detail === 0;
    return !keyboard && finite(arg.clientX) && finite(arg.clientY)
      ? { x: arg.clientX, y: arg.clientY }
      : target;
  }
  if ('getBoundingClientRect' in arg || 'current' in arg) return arg;
  return finite(arg.x) && finite(arg.y) ? arg : target;
};

/**
 * Plays `effect` from `target` each time `reward()` is called. `config`
 * overrides the effect's defaults, and `options` holds the burst options
 * (ADR 0041). Bursts that are still running when the component unmounts are
 * cancelled, so `onComplete` isn't called for them (ADR 0042).
 */
export const useReward = <E extends Effect>(
  target: RewardTarget,
  effect: E,
  config?: Partial<ConfigOf<E>>,
  options?: RewardOptions
): UseRewardResult => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [bursts] = useState(() => new Set<Burst>());
  const unmounted = useRef(false);
  const latest = useRef({ target, effect, config, options });
  // Runs in the commit, before any layout effect, so a call from an effect or
  // a handler sees this render's arguments and never a discarded render's
  // (ADR 0040).
  useInsertionEffect(() => {
    latest.current = { target, effect, config, options };
  });

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
      for (const burst of bursts) burst.cancel();
      bursts.clear();
    };
  }, [bursts]);

  const reward = useCallback(
    (origin?: Origin | PositionedEvent): Burst => {
      const { target, effect, config, options } = latest.current;
      const burst = fire(effect, {
        ...options,
        origin: startOf(origin, target),
        config,
      });
      bursts.add(burst);
      burst.finished.then(() => {
        bursts.delete(burst);
        if (!unmounted.current && bursts.size === 0) setIsAnimating(false);
      });
      if (!unmounted.current) {
        setIsAnimating(true);
      } else {
        // When Strict Mode or <Activity> reconnects effects, a child's effect
        // can call this between this hook's cleanup and its next setup. The
        // setup has run by the next microtask, unless the component is gone.
        queueMicrotask(() => {
          if (!bursts.has(burst)) return;
          if (unmounted.current) burst.cancel();
          else setIsAnimating(true);
        });
      }
      return burst;
    },
    [bursts]
  );

  return { reward, isAnimating };
};
