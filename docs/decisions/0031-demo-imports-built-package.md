# 0031. `demo/` imports the built package

- **Status:** Accepted
- **Date:** 2026-10-22

`demo/` depends on `react-rewards` as `workspace:*`, so it imports `dist/` through the `exports` map, as users do. During development `pnpm dev` rebuilds the library next to the demo's dev server, and `pnpm e2e` builds it first.

**Why:** The browser tests then check the published build. An alias to `src/` would also take the `@/` alias, which the demo's own code needs for `demo/src`.

**Consequences:** Development needs two processes, and the library has to be built once before the demo starts.
