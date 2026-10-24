# 0042. `reward()` returns the burst, and rewards stack

- **Status:** Accepted. The `origin` bullet is refined by [0044](0044-reward-handles-pointer-events.md).
- **Date:** 2026-10-23

- The hook returns `{ reward, isAnimating }`.
- `reward(origin?)` fires from `origin`, or from the target without one, and returns the `Burst`.
- Each call starts a new burst, and earlier ones keep running. `isAnimating` stays true until all of them have ended.
- Unmounting cancels the hook's bursts. `onComplete` isn't called, and no state is updated after unmount.

**Why:** A caller can await or cancel one burst without calling `fire()`. Stacking matches v2.

**Consequences:** Cancelling all of a hook's bursts at once needs an unmount. A hook-level `cancel()` can be added later.
