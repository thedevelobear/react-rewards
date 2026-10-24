# 0038. Emoji is redesigned, not a copy of v2's look

- **Status:** Accepted
- **Date:** 2026-10-23

Emoji fly like confetti, without the flutter: they launch within the cone, slow with drag and fall with gravity. Each emoji in `emojis` is one sprite, used in turn, so every emoji shows up even in a small burst. Each pops in over 0.15 s, varies its scale by ±10%, and, with `rotate` on, starts near upright and spins slowly. It fades over the last 20% of its life. The defaults keep v2's emoji.

**Why:** Emoji and confetti then move alike, and confetti was already redesigned ([ADR 0026](0026-modernised-confetti.md)). Varying the scale rather than the size adds no atlas entries.

**Consequences:** Emoji look different from v2. v2's `emoji` option is `emojis`, and `elementSize` is `size`.
