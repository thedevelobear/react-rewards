# 0018. Particle stepping lives in `core/simulation/`

- **Status:** Accepted
- **Date:** 2026-10-22

`core/simulation/` holds one burst's simulation: `createSimulation(effect, config, options)` returns `{ pool, step(dt), done }`. It spawns `count` particles, steps them with the effect's `update`, and removes them at the end of their life. It is pure and runs in Node. `core/pool/` stays a data structure that knows nothing about effects, and `core/fire/` wraps a simulation with the loop, the renderer and the burst's lifecycle.

**Why:** Frame-rate independence has to be tested in PR 3, before `core/fire/` and the renderers exist.

**Consequences:** Frame-rate independence and determinism are tested in Node, without a renderer, and `core/fire/` stays small.
