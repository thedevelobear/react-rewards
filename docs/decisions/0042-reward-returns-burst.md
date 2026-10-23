# 0042. `reward()` returns the burst, and rewards stack

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
The plan has the hook return `{ reward, isAnimating }`, with `reward(origin?)` firing from the target or from a given point. It doesn't say what `reward()` returns. `fire()` returns a `Burst` with `cancel()` and `finished` ([ADR 0025](0025-cancel-skips-on-complete.md)). The plan also doesn't say what a second call does while a burst is running, or what `isAnimating` means then.

Options considered:
- `reward()` returns the `Burst`, and the hook returns `{ reward, isAnimating }`.
- The same, plus a hook-level `cancel()` that stops every burst the hook started.
- `reward()` returns nothing, as in v2.

## Decision
- The hook returns `{ reward, isAnimating }`.
- `reward(origin?)` fires the effect and returns the `Burst` that `fire()` returns. `origin` is any `Origin` (a point, an element or a ref). Without one, the burst starts from the target.
- Each call starts a new burst, and earlier bursts keep running, as in v2.
- `isAnimating` is true from a call until every burst the hook started has ended, however it ended.
- Unmounting cancels every burst the hook started. `onComplete` isn't called for them ([ADR 0025](0025-cancel-skips-on-complete.md)), their `finished` resolves with `'cancelled'`, and the hook updates no state after unmount.

## Consequences
- A caller can await one burst's `finished` or cancel it, without calling `fire()` directly.
- There is no way to cancel all of a hook's bursts at once, short of unmounting. A hook-level `cancel()` can be added later without breaking callers.
- A burst that is skipped, for example under reduced motion, can make `isAnimating` true for a render before it turns false, because `finished` resolves in a microtask.
