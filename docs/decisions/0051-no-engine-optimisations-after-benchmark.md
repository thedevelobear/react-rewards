# 0051. Off-screen culling and the particle view's accessors stay as they are

- **Status:** Proposed
- **Date:** 2026-10-23

## Context
Step 1c of the plan left two possible optimisations for the PR 11 benchmark to settle:
- The particle view gives effects accessors over the pool's typed arrays, which "cost a little compared with raw array indexing".
- The Canvas 2D renderer draws every live particle, including any off screen, and the benchmark was to show "whether culling is worth adding".

The benchmark ([2026-10-23-v3-engine](../benchmarks/2026-10-23-v3-engine.md)) shows WebGL at 120 fps for every effect up to 20000 particles, with 2.7 to 3.8 ms of script a frame at 20000. Canvas 2D holds 120 fps up to 5000. The effects' default counts are 10 to 50. The benchmark doesn't isolate the accessors' share of the script time, and most particles stay on screen during a burst, so it can't show what culling would save.

## Decision
- The particle view keeps its accessors. The simulation isn't rewritten to index the typed arrays directly.
- The Canvas 2D renderer keeps drawing every live particle. Off-screen particles aren't culled.

## Consequences
- The engine's code and the effect contract don't change in PR 11.
- Either optimisation can be added later without changing the public API, if a profile on a slower machine shows it matters. `pnpm bench` measures the change ([ADR 0048](0048-benchmark-script-in-demo.md)).
