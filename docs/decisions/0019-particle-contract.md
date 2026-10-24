# 0019. Particle fields, units and stepping in the effect contract

- **Status:** Accepted. The sprite sources are refined by [0020](0020-sprite-sizes.md).
- **Date:** 2026-10-22

- Effects see a particle as one reused `Particle` view whose getters and setters read and write the pool's typed arrays. Effects don't keep it after `spawn` or `update` returns.
- Fields: `x`, `y`, `vx`, `vy`, `rotation`, `scale`, `scaleX`, `scaleY`, `alpha`, `sprite`, `age` (read-only), `life`, and the free slots `s0` to `s3`.
- Units: CSS pixels in viewport coordinates with y down, pixels per second, radians, and seconds for `age` and `life`.
- A new particle starts at the origin, at rest, with scales and alpha 1 and `life = lifetime / 1000`. Then `spawn` runs.
- Each step advances `age`, runs `update`, moves the particle by the average of its velocity before and after `update`, and removes it once `age >= life`. Effects change velocity, never position.
- Gravity with drag uses `math.accelerate`, and decay alone uses `math.damp`.
- `ctx.spawn(init)` adds a particle at the current one's position. It is first updated on the next step.
- Every config has `count` and `lifetime` (milliseconds). `defineEffect` infers the config type from `defaults` and freezes the effect.

**Why:** Averaging the velocities makes constant acceleration exact at any frame rate, so frame-rate independence comes from the core, not from each effect. The view lets effect code read like plain objects while the pool stays a structure of arrays the renderers upload directly. Applying gravity and drag as two separate steps drifted 5.8 px from a 144 Hz run at 30 Hz, against 0.15 px with `accelerate`.

**Consequences:** An effect that wants to place particles directly sets their velocity to 0 and writes `x` and `y`. More slots can be added later without breaking effects.
