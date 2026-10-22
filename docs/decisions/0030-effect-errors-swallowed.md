# 0030. Errors thrown by an effect are swallowed

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
The plan has `fire()` catch an effect's errors per burst: that burst ends and `onComplete` is called, so one broken effect can't stop the loop or other bursts. It did not say whether the error is reported. Options considered: pass it to the global `reportError()`, so it reaches the console and error trackers; log it with `console.error`; or swallow it. The maintainer chose to swallow it, because rewards are decorative.

## Decision
- An error thrown by an effect's `sprites`, `spawn` or `update`, and a failed sprite load, ends that burst only ([ADR 0025](0025-cancel-skips-on-complete.md)). It is not rethrown, logged or reported.
- Errors thrown by a caller's `onComplete` are not covered. They surface as usual.

## Consequences
- A page never shows an error because of a reward.
- A broken custom effect fails silently: its bursts end early or never show. PR 12's effect guide tells authors to test effects in Node with a simulation, as the built-in effects' tests do.
- Changing this later to report the error is a small change, plus a new ADR.
