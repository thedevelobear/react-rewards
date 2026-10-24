# 0026. Confetti is redesigned, not a copy of v2's look

- **Status:** Accepted. The fall reworked by [0059](0059-confetti-falls-like-paper.md)
- **Date:** 2026-10-22

Confetti looks like paper. Rectangles, one sprite per colour, launch within the cone, slow with drag and fall with gravity. Each flips about its horizontal axis, spins slowly and flutters on top of its flight. It fades over the last 20% of its life, and lifetimes vary from 85 to 100% so pieces don't vanish together. The defaults keep v2's five colours.

**Why:** v2's look relied on a CSS `rotate3d`, which the sprite engine doesn't have, so the flip is drawn with `scaleY`, closer to paper confetti such as canvas-confetti's.

**Consequences:** Confetti looks different from v2.
