# 0053. The math helpers are public

- **Status:** Accepted
- **Date:** 2026-10-24

## Context
[ADR 0028](0028-public-exports-from-pr-5.md) kept the helpers in `core/math` internal, and left it to PR 12 to decide how custom effects get them. The built-in effects all use them: `accelerate` for gravity with drag, `damp` for decay, `clamp`, `degToRad`, and `easeOutCubic` in the emoji. Without them, a custom effect made with `defineEffect` re-implements drag and gravity, and an exact `accelerate` is easy to get subtly wrong at low frame rates.

Options considered:
- Export them from the package's main entry.
- Export them from a subpath, `react-rewards/math`. That keeps the main list short, but adds a build entry, an exports-map entry and a second target for publint and attw.
- Keep them internal, and have the effect guide show the few lines a custom effect needs.

## Decision
- `src/index.ts` exports `accelerate`, `clamp`, `damp`, `degToRad` and `lerp`; the easings `linear`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic` and `easeInOutCubic`; `createRng`; and the `Easing` type. `Rng` was already exported.
- `Point` stays internal, because no public signature uses it.
- They are documented by their JSDoc in `core/math`, and the README's custom-effect section uses them.

## Consequences
- A custom effect is written the same way as a built-in one, with the same frame-rate-independent stepping.
- The package is marked `sideEffects: false`, so an app that doesn't import a helper doesn't bundle it. size-limit measures every export, so its report grows by the helpers' size ([ADR 0013](0013-size-limit-report-only.md)).
- The helpers are now public API. Renaming one, or changing what it returns, is a breaking change.
