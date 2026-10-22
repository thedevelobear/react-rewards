# 0031. `demo/` imports the built package

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
Step 3 of the plan says the demo "imports `react-rewards` from the workspace, so the live source is demoed". That fits two setups:
- A `workspace:*` dependency, resolved through the package's `exports` map to `dist/`.
- An Rsbuild alias from `react-rewards` to `../src/index.ts`, plus `@/` to `../src` for the library's own imports. Then `@/` can't also point at `demo/src` for the site's code (step 1b, rule 9).

## Decision
- `demo/package.json` depends on `react-rewards` as `workspace:*`. The demo imports what users install: `dist/`, through the `exports` map.
- During development, `pnpm dev` (Rslib in watch mode) runs next to the demo's dev server, which reloads when `dist/` changes.
- The browser tests build the library first (`pnpm e2e` runs `pnpm build`).

## Consequences
- The browser tests check the published build, declarations aside.
- Development needs two processes, and the demo can't start before the library has been built once.
- The demo's own code is free to use `@/` for `demo/src` when PR 9 needs it.
