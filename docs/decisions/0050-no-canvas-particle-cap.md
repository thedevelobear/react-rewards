# 0050. The Canvas 2D fallback has no particle cap

- **Status:** Proposed
- **Date:** 2026-10-23

## Context
Step 1c of the plan says: "If the Canvas 2D fallback is unusable at high counts, add a particle cap for it." The PR 11 benchmark ([2026-10-23-v3-engine](../benchmarks/2026-10-23-v3-engine.md)) measured both renderers at 500, 5000 and 20000 particles on an M1 Pro at 120 Hz:
- Canvas 2D holds 120 fps at 5000 for every effect, with the main thread 56 to 83% busy.
- At 20000 it falls to 40 to 65 fps, with the main thread 96 to 98% busy. Bursts still last their nominal time, because the frame rate stays above the loop's 30 fps floor.
- WebGL holds 120 fps at 20000.

The effects' default counts are 10 to 50, and the effect pages' sliders go up to 200. Canvas 2D runs only where WebGL2 isn't available, or when `setRenderer('canvas')` forces it.

Options considered: no cap; a cap of 5000 particles per burst under Canvas 2D, the highest count that held 120 fps; or a cap on the particles drawn per frame across all bursts.

## Decision
- The Canvas 2D renderer has no particle cap. It draws every live particle of every running burst, as WebGL does.
- A burst spawns `count` particles whichever renderer draws it.

## Consequences
- A page that fires 20000 particles on a browser without WebGL2 plays at a lower frame rate and keeps the main thread busy for the burst, but the burst keeps its timing.
- The same config looks the same on both renderers, so the parity spec ([ADR 0035](0035-parity-diff-with-pixelmatch.md)) still compares like with like.
- A cap can be added later if a slower machine shows Canvas 2D dropping below 30 fps at counts people use. That would need a new benchmark run on that machine.
