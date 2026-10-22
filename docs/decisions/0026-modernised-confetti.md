# 0026. Confetti is redesigned, not a copy of v2's look

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
v2's confetti draws squares that wobble sideways, tumble with a CSS `rotate3d`, shrink a little and fade over the second half of their life. The new engine draws sprites with rotation, separate x and y scale and alpha, and has no 3D transform. The plan's sketch used 8 by 5 rectangles. Options considered: re-create v2's look, or redesign it to look like paper confetti (closer to canvas-confetti).

## Decision
- Pieces are rectangles `size` wide and `size * 0.625` tall (8 by 5 at the default), one sprite per colour, picked at random.
- Each piece launches at `angle` plus or minus half of `spread`, at 0.5 to 1.5 times `velocity`, then slows with `drag` and falls with `gravity` (`math.accelerate`).
- It flips about its horizontal axis (`scaleY` is the cosine of a phase that turns at 5 to 9 radians per second), spins slowly in the plane, and flutters around a small circle (radius `1.25 * size`, 3 to 6 radians per second either way) on top of its flight.
- It is fully opaque until the last 20% of its life, then fades out. Each piece lives 85 to 100% of `lifetime`, so they don't all vanish at once and the burst still ends by `lifetime`.
- Defaults: `count` 50, `size` 8, v2's five colours (`#A45BF1`, `#25C6F6`, `#72F753`, `#F76C88`, `#F5F770`), `angle` 90, `spread` 45, `velocity` 1500, `drag` 3, `gravity` 900, `lifetime` 3000.

## Consequences
- The new confetti looks different from v2. The change is visible in `demo/` and in the README's demo link (PR 12).
- The flutter is added to the velocity and removed again on the next step, so drag and gravity act only on the flight. The frame-rate test covers it.
- The numbers are tuned by eye in `demo/`. Changing them later changes the look, not the contract.
