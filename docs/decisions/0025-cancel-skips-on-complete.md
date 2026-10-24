# 0025. `cancel()` doesn't call `onComplete`, and `finished` says how a burst ended

- **Status:** Accepted
- **Date:** 2026-10-22

- `onComplete` is called once, in a microtask, when a burst ends on its own: its last particle is gone, or it was skipped (reduced motion, a ref with no element, no renderer, sprites that fail to load, or an effect that throws).
- `cancel()` ends the burst at once without calling `onComplete`. Cancelling an ended burst does nothing.
- `finished` never rejects. It resolves with `'complete'`, `'skipped'` (nothing was drawn) or `'cancelled'`.

**Why:** The hook cancels its bursts on unmount, and callbacks shouldn't run after their component is gone. The Web Animations API doesn't fire `finish` on `cancel()` either. A promise that never rejects never becomes an unhandled rejection.

**Consequences:** A caller who cancels and still wants to know uses `finished`.
