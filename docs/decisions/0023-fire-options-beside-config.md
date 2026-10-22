# 0023. `fire()` takes burst options beside the effect's config

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
The plan sketched the vanilla API as `fire(effect, { origin, config })`. It also listed `zIndex` and `onComplete` in "one consistent config for every effect". No effect reads those two. They belong to the burst, like `origin`, the reduced-motion opt-out and a seed for repeatable bursts.

Options considered:
- Burst options beside `config`: `fire(confetti, { origin, config: { count: 120 }, zIndex, onComplete })`.
- One flat object: `fire(confetti, { origin, count: 120, zIndex, onComplete })`. Shorter, but effect keys and burst keys share one namespace, so no effect could use `origin` or `zIndex` as a config name.

## Decision
- `fire(effect, options)` takes `{ origin, config?, zIndex?, onComplete?, respectReducedMotion?, seed? }`.
- `config` is a `Partial` of the effect's config. It holds only what the effect reads. `resolveConfig` applies it over the effect's defaults, and keys set to `undefined` keep their default.
- `origin` is a point in viewport CSS pixels, an element or a ref (`core/origin`). It is resolved when `fire()` is called, so the burst starts where the target was at the click. A ref with no element skips the burst.
- `zIndex` defaults to 2147483647 ([ADR 0029](0029-default-z-index.md)). `respectReducedMotion` defaults to `true`. `seed` seeds the burst's generator, and is random when left out.
- `fire()` returns `{ cancel, finished }` synchronously ([ADR 0025](0025-cancel-skips-on-complete.md)).

## Consequences
- A custom effect can use any config key.
- Callers write one more level of nesting. The hook's argument shape is decided in PR 8, which may take a flat object and split it.
- The README's "from v2" table (PR 12) maps v2's flat config to `config` plus the burst options.
