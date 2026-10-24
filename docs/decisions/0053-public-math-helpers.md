# 0053. The math helpers are public

- **Status:** Accepted
- **Date:** 2026-10-24

The main entry exports `accelerate`, `clamp`, `damp`, `degToRad`, `lerp`, `createRng`, the easings and the `Easing` type, documented by their JSDoc. `Point` stays internal.

**Why:** Custom effects then step particles the way the built-in ones do. An exact `accelerate` is easy to get wrong at low frame rates. A `react-rewards/math` subpath would add a build entry and a second target for the package checks.

**Consequences:** The helpers are public API, so changing one is a breaking change. `sideEffects: false` keeps unused ones out of bundles.
