# 0025. `cancel()` doesn't call `onComplete`, and `finished` says how a burst ended

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
`fire()` returns `{ cancel(), finished }`, and a burst takes an `onComplete` callback ([ADR 0023](0023-fire-options-beside-config.md)). The plan did not say whether cancelling calls `onComplete`, or what `finished` resolves with. The hook (PR 8) cancels its bursts on unmount, so calling `onComplete` on cancel would run the caller's callback after their component is gone. The Web Animations API doesn't fire `finish` on `cancel()` either.

## Decision
- `onComplete` is called once when a burst ends on its own: its last particle is removed, or it is skipped. A burst is skipped when the user prefers reduced motion (and `respectReducedMotion` is on), the origin is a ref with no element, no renderer is available, its sprites fail to load, or the effect throws ([ADR 0030](0030-effect-errors-swallowed.md)).
- `cancel()` ends the burst at once. Its particles are not drawn again, and `onComplete` is not called. Cancelling a burst that has ended does nothing.
- `finished` resolves once and never rejects, with `'complete'`, `'skipped'` or `'cancelled'`. `'skipped'` means the burst ended before its simulation started, so nothing was drawn. An effect that throws in `sprites` or `spawn` gives `'skipped'`. One that throws in `update` gives `'complete'`.
- `onComplete` runs in a microtask, never inside `fire()` or inside a frame. If it throws, the error is uncaught as usual, and other bursts are not affected.

## Consequences
- The hook can cancel on unmount without running user callbacks.
- A caller who cancels and still wants a callback uses `finished`.
- Because `finished` never rejects, an unawaited burst never produces an unhandled rejection.
