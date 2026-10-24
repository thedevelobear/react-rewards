# 0050. The Canvas 2D fallback has no particle cap

- **Status:** Accepted
- **Date:** 2026-10-23

The Canvas 2D renderer draws every live particle, as WebGL does, and a burst spawns `count` particles whichever renderer draws it.

**Why:** In the [v3 engine benchmark](../benchmarks/2026-10-23-v3-engine.md), Canvas 2D holds 120 fps at 5000 particles and 40 to 65 fps at 20000, above the loop's 30 fps floor, so bursts keep their timing. The default counts are 10 to 50, and Canvas 2D runs only without WebGL2. A cap would also make the renderers differ.

**Consequences:** 20000 particles without WebGL2 play at a lower frame rate.
