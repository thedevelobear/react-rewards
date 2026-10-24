# 0051. Off-screen culling and the particle view's accessors stay as they are

- **Status:** Accepted
- **Date:** 2026-10-23

The particle view keeps its accessors over the typed arrays, and Canvas 2D keeps drawing off-screen particles.

**Why:** In the [v3 engine benchmark](../benchmarks/2026-10-23-v3-engine.md), WebGL holds 120 fps at 20000 particles and Canvas 2D at 5000, far above the default counts. Neither optimisation has a measured cost to remove.

**Consequences:** Either can be added later without changing the public API, measured with `pnpm bench`.
