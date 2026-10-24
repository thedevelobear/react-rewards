# 0032. The build leaves test declarations out of `dist/`

- **Status:** Accepted
- **Date:** 2026-10-22

`tsconfig.build.json` extends `tsconfig.json` and excludes `src/**/test.ts`, `src/**/dom-test.ts` and `src/test-utils`. `rslib.config.ts` builds with it, and Rstest, which extends the Rslib config, uses it too. `tsconfig.json` still includes everything, so `pnpm typecheck` checks the tests.

**Why:** Rslib declares every file the tsconfig includes, so test declarations shipped in the package.

**Consequences:** A new test-only file name or folder has to be added to the exclude list.
