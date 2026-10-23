# 0038. Emoji is redesigned, not a copy of v2's look

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
v2's emoji launch in a cone, slow by a per-frame decay, and drift down at a constant 5 px per frame. Each starts at a random angle of up to 180° and spins at 0.05 rad per frame. Sizes vary by 0 to 3 px, the burst drifts sideways by up to 60 px, and the emoji fade over the second half of their life. The defaults are 20 emoji of 25 px (`🤓`, `😊`, `🥳`) for 200 frames.

Confetti was redesigned rather than copied ([ADR 0026](0026-modernised-confetti.md)). Options considered: re-create v2's motion in physical units ([ADR 0024](0024-physical-config-units.md)), or redesign emoji in line with the new confetti.

## Decision
- The config is `count`, `size` (the font size in CSS pixels), `emojis`, `angle`, `spread`, `velocity`, `drag`, `gravity`, `lifetime` and `rotate`.
- Each emoji in `emojis` is one sprite (`{ emoji, size }`). Particles take them in turn (`index % emojis.length`), so every emoji shows up even in a small burst.
- Each emoji launches at `angle` plus or minus half of `spread`, at 0.5 to 1.5 times `velocity`, then slows with `drag` and falls with `gravity` (`math.accelerate`), as confetti does, without the flutter.
- It pops in: its scale grows from 0 over the first 0.15 s of its life (`easeOutCubic`).
- Its scale is 0.9 to 1.1, so sizes vary without adding atlas entries ([ADR 0020](0020-sprite-sizes.md)).
- With `rotate` on, it starts within 15° of upright and spins at 0.5 to 2 rad/s, either way. With `rotate` off, it stays upright.
- It is fully opaque until the last 20% of its life, then fades out. Each emoji lives 85 to 100% of `lifetime`, so the burst still ends by `lifetime`.
- Defaults: `count` 20, `size` 25, `emojis` v2's `🤓`, `😊` and `🥳`, `angle` 90, `spread` 45, `velocity` 1500, `drag` 3, `gravity` 900, `lifetime` 3000, `rotate` true.

## Consequences
- The new emoji look different from v2. v2's `emoji` option is now `emojis`, and `elementSize` is `size`. The README's "from v2" table (PR 12) lists both.
- Emoji and confetti share their flight numbers, so the two effects move alike by default.
- Glyphs come from the platform's emoji font, so emoji look different on each OS, as they did in v2.
- The numbers are tuned by eye in `demo/`. Changing them later changes the look, not the contract.
