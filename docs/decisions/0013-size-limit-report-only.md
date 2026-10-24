# 0013. size-limit reports the bundle size, with no budget

- **Status:** Accepted
- **Date:** 2026-10-22

size-limit runs in CI and as `pnpm size`, with no `limit`. It bundles `dist/index.js` with Rolldown (`@size-limit/preset-small-lib`), leaves React out, and reports gzip rather than brotli, so the numbers compare with v2.1.0's 3.72 kB.

**Why:** The engine, two renderers and three effects are more code than v2's DOM animations, so a budget based on v2 would fail. v2 was small because it did little. Size is optimised when it becomes a problem.

**Consequences:** Every run shows the size, but nothing gates it. A budget needs a new ADR.
