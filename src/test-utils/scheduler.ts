import type { FrameScheduler } from '@/core/loop';
import type { FakeScheduler } from './types';

/** A scheduler driven by hand: `tick(time)` runs the pending frame. */
export const createFakeScheduler = (): FakeScheduler => {
  let pending: ((time: number) => void) | undefined;
  let handles = 0;
  const scheduler: FrameScheduler = {
    request: (callback) => {
      pending = callback;
      handles += 1;
      return handles;
    },
    cancel: () => {
      pending = undefined;
    },
  };
  return {
    scheduler,
    get pending() {
      return pending !== undefined;
    },
    tick: (time: number) => {
      const callback = pending;
      pending = undefined;
      callback?.(time);
    },
  };
};
