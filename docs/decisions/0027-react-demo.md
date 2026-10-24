# 0027. `demo/` is a React 19 and Rsbuild app from the start

- **Status:** Accepted
- **Date:** 2026-10-22

`demo/` is a private workspace package built with Rsbuild and `@rsbuild/plugin-react`, rendering with React 19 in Strict Mode. Its buttons call `fire()` until the hook exists, then `useReward`. It has its own `tsconfig.json` and `typecheck`, against the built declarations.

**Why:** The preview site is a React app, so starting with React means nothing is rewritten, and Strict Mode is exercised from the start.

**Consequences:** React DOM and Rsbuild are dev-only dependencies, and aren't published.
