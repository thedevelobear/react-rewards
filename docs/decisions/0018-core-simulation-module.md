# 0018. Particle stepping lives in `core/simulation/`

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
PR 3 has to test frame-rate independence. That needs code that spawns a burst's particles, runs the effect's `update` over the pool on every tick, and removes dead particles. The architecture in the plan has no folder for it. `core/fire/` owns the burst lifecycle (cancel, the `finished` promise), but it arrives in PR 5, together with the renderer it drives.

Options considered: a new `core/simulation/` folder, stepping inside `core/pool/`, or starting `core/fire/` early.

## Decision
- `core/simulation/` holds one burst's simulation: `createSimulation(effect, config, options)` returns `{ pool, step(dt), done }`. It spawns `count` particles at the origin, steps them with the effect's `update`, and removes them when their age reaches their life.
- It is pure and has no DOM access, so it runs in Node.
- `core/pool/` stays a data structure that knows nothing about effects.
- `core/fire/` (PR 5) wraps a simulation with the shared loop and the renderer, and adds the lifecycle around it.

## Consequences
- Frame-rate independence and determinism are tested in Node, without a renderer.
- `fire/` stays small: lifecycle, cancel and the promise.
- The architecture in the plan gains one folder.
