# 0023. `fire()` takes burst options beside the effect's config

- **Status:** Accepted
- **Date:** 2026-10-22

`fire(effect, { origin, config?, zIndex?, onComplete?, respectReducedMotion?, seed? })` returns `{ cancel, finished }` synchronously. `config` is a `Partial` of the effect's config, applied over its defaults, and `undefined` keeps a default. `origin` is a viewport point, an element or a ref, resolved when `fire()` is called. A ref with no element skips the burst. `respectReducedMotion` defaults to `true`, and `seed` is random when left out.

**Why:** `zIndex`, `onComplete` and the rest belong to the burst, not the effect. Keeping them out of `config` leaves every key free for custom effects. A flat object would make names like `origin` unusable in a config.

**Consequences:** Callers write one more level of nesting.
