import type { FrameCallback, FrameScheduler, Loop } from './types';

/**
 * The longest step one frame can take, in seconds. A tab that was hidden or
 * stalled resumes with this step instead of jumping its particles forward.
 */
export const MAX_DT: number = 1 / 30;

/**
 * Creates a loop that runs while it has callbacks. Its first frame has a
 * `dt` of 0. After that, `dt` is the time since the previous frame, capped
 * at `maxDt`.
 */
export const createLoop = (
  scheduler: FrameScheduler,
  maxDt: number = MAX_DT
): Loop => {
  const callbacks = new Set<FrameCallback>();
  let handle: number | undefined;
  let lastTime: number | undefined;

  const frame = (time: number): void => {
    // Schedule first, so a callback that throws doesn't stop the loop.
    handle = scheduler.request(frame);
    const elapsed = lastTime === undefined ? 0 : (time - lastTime) / 1000;
    const dt = Math.min(Math.max(elapsed, 0), maxDt);
    lastTime = time;
    // Callbacks added during this frame start on the next one.
    for (const callback of [...callbacks]) {
      if (callbacks.has(callback)) callback(dt);
    }
  };

  return {
    get running() {
      return handle !== undefined;
    },
    add: (callback) => {
      callbacks.add(callback);
      if (handle === undefined) {
        lastTime = undefined;
        handle = scheduler.request(frame);
      }
      return () => {
        if (!callbacks.delete(callback)) return;
        if (callbacks.size === 0 && handle !== undefined) {
          scheduler.cancel(handle);
          handle = undefined;
        }
      };
    },
  };
};

let shared: Loop | undefined;

/**
 * The page's one loop, on `requestAnimationFrame`. It is created on first
 * use, so importing this module is safe during server rendering.
 */
export const getLoop = (): Loop => {
  shared ??= createLoop({
    request: (callback) => requestAnimationFrame(callback),
    cancel: (handle) => cancelAnimationFrame(handle),
  });
  return shared;
};
