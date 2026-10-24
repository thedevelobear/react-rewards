# 0030. Errors thrown by an effect are swallowed

- **Status:** Accepted
- **Date:** 2026-10-22

An error thrown by an effect's `sprites`, `spawn` or `update`, or a failed sprite load, ends that burst only ([ADR 0025](0025-cancel-skips-on-complete.md)). It isn't rethrown, logged or reported. Errors thrown by a caller's `onComplete` surface as usual.

**Why:** Rewards are decorative, so a page should never show an error because of one, and one broken effect mustn't stop the loop or other bursts.

**Consequences:** A broken custom effect fails silently, so effects are tested in Node through a simulation, as the guide says.
