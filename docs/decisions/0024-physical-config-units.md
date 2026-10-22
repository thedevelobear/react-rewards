# 0024. Effect configs use physical units

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
[ADR 0019](0019-particle-contract.md) set the units effect code works in: CSS pixels, pixels per second, radians and seconds. The units of an effect's public config were left for PR 5. v2 used per-frame numbers (`startVelocity: 35` pixels per frame, `decay: 0.94` per frame). The plan's sketch mixed the two (`velocity: 35`, `drag: 0.06`, `gravity: 900`).

Options considered:
- Physical units, the same as the contract's.
- Small v2-like numbers, which every effect converts to per-second units.

## Decision
Every effect's config uses these units:
- Sizes in CSS pixels.
- `velocity` in pixels per second.
- `gravity` in pixels per second squared, pointing down.
- `drag` per second, the rate that `math.damp` and `math.accelerate` take. A drag of 3 multiplies a velocity by e^-3 each second, and with gravity it sets a terminal fall speed of `gravity / drag`.
- `lifetime` in milliseconds.
- `angle` and `spread` in degrees. `angle` is counter-clockwise from the positive x axis, so 90 points straight up. `spread` is the full width of the cone around it.

Effects convert degrees with `math.degToRad`. The simulation converts `lifetime` to seconds.

## Consequences
- A config value is the number effect code works with, so built-in and custom effects read the same way, and none converts per-frame numbers.
- The README's "from v2" table (PR 12) can't map numbers one to one. It names the new units and the defaults instead.
- The demo's sliders (PR 10) use these units.
