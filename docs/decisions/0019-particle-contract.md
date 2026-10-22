# 0019. Particle fields, units and stepping in the effect contract

- **Status:** Proposed. It becomes Accepted when the maintainer merges PR 3. The next PR's first commit updates this line.
- **Date:** 2026-10-22

## Context
The plan's effect contract is a sketch ("illustrative"). It names the particle's fields and the `spawn` and `update` hooks ([ADR 0005](0005-effect-contract-scope.md)), but leaves the details open. The pool is a structure of arrays (one `Float32Array` per field), while the sketch has effects write `p.x`. PR 3 writes the contract types, so the details have to be settled. They were chosen while writing it, and are proposed here for the maintainer to accept or change at review.

## Decision
**Particles**
- Effects see a particle as a `Particle` object. It is a view over the pool: one reused object whose getters and setters read and write the typed arrays at its current index. Effects must not keep a reference to it after `spawn` or `update` returns.
- Fields: `x`, `y`, `vx`, `vy`, `rotation`, `scale`, `scaleX`, `scaleY`, `alpha`, `sprite`, `age` (read-only), `life`, and four free slots `s0` to `s3`.
- Units: CSS pixels in viewport coordinates with y pointing down, pixels per second, radians, and seconds for `age` and `life`. The drawn size is `scale * scaleX` by `scale * scaleY`. `sprite` is an index into the list that `sprites` returns.

**Stepping**
- A new particle starts at the burst's origin with velocity 0, rotation 0, scales 1, alpha 1, sprite 0, slots 0 and `life = lifetime / 1000`. Then `spawn` runs.
- On each step, the simulation advances `age` by `dt`, then runs `update`, then moves the particle by the average of its velocity before and after `update`, then removes it if `age >= life`.
- Effects change velocity (forces such as gravity and drag) and never integrate position. Averaging the two velocities makes constant acceleration exact at any frame rate, so frame-rate independence comes from the core rather than from each effect's maths.
- Drag needs exponential maths. Effects use `math.accelerate(velocity, acceleration, drag, dt)` for gravity with drag, and `math.damp` for decay alone. Measured over 50 particles after 1 s, the largest gap to a 144 Hz run was 0.15 px at 30 Hz with `accelerate`. Applying gravity and then drag as two separate steps gave 5.8 px.
- Age and life are compared as stored (float32), so a life that is a whole number of steps ends on the step where it is reached.
- `ctx.spawn(init)` adds a particle at the current particle's position with the default fields, then runs `init` on it. The new particle is first updated on the next step.

**Config and sprites**
- Every effect's config has `count` (particles per burst) and `lifetime` (milliseconds). The other shared names (`size`, `colors`, `angle` and so on) are settled when confetti is ported in PR 5.
- `SpriteSource` is `{ shape: 'rect' | 'circle', color }`, `{ emoji }`, `{ svg }`, or `{ key, draw(ctx, size) }`. A draw function needs a `key`, because the atlas caches sprites by key and a function cannot serve as one. PR 4 may refine these when it builds the atlas.
- `defineEffect` infers the config type from `defaults` and freezes the effect and a copy of its defaults. `resolveConfig(effect, overrides)` applies overrides and skips keys set to `undefined`.

## Consequences
- Effect code reads like plain object code, while the pool stays a structure of arrays that the renderers can upload directly.
- The getters and setters cost a little per access compared with raw array indexing. The benchmark in PR 11 shows whether that matters at 20000 particles.
- An effect that wants direct control of position sets the velocity to 0 and writes `x` and `y` itself.
- Four slots may prove too few. Adding slots is an additive change.
