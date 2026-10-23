import type { Burst, FireOptions } from '@/core/fire';
import type { Measurable, Origin, TargetRef } from '@/core/origin';

/** What a reward fires from: an element, or a ref to one. */
export type RewardTarget = Measurable | TargetRef;

/**
 * The burst options of `fire()`, without `origin` and `config`, which the
 * hook takes as arguments (ADR 0041).
 */
export type RewardOptions = Omit<FireOptions, 'origin' | 'config'>;

/**
 * An event with a pointer position, such as a click. `reward` fires from
 * the pointer when it handles one (ADR 0044).
 */
export interface PositionedEvent {
  readonly clientX: number;
  readonly clientY: number;
  readonly type?: string;
  readonly detail?: number;
}

/** What `useReward` returns. */
export interface UseRewardResult {
  /**
   * Fires the effect from `origin`, or from the target's centre, and returns
   * the burst. Passed straight to a handler (`onClick={reward}`), it fires
   * from the pointer, or from the target for a keyboard click (ADR 0044).
   * Each call starts a new burst. The function stays the same while the
   * component is mounted, and each call uses the latest arguments
   * (ADR 0040).
   */
  readonly reward: (origin?: Origin | PositionedEvent) => Burst;
  /** True from a `reward()` call until every burst it started has ended. */
  readonly isAnimating: boolean;
}
