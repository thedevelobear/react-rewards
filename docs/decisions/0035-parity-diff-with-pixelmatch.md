# 0035. The parity spec compares screenshots with pixelmatch

- **Status:** Accepted
- **Date:** 2026-10-22

The parity spec renders one seeded burst at a fixed moment, driven by Playwright's fake clock, once with WebGL and once with Canvas 2D. It decodes both screenshots with pngjs and counts the differing pixels with pixelmatch, against a measured tolerance. It also checks that each frame differs from a blank one.

**Why:** Playwright only compares a screenshot with a stored baseline, and baselines differ between macOS and the Linux CI.

**Consequences:** No baseline images to maintain. `demo/` adds `pixelmatch`, `pngjs` and `@types/pngjs` as dev dependencies.
