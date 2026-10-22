# 0032. The build leaves test declarations out of `dist/`

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
Rslib emits a declaration for every file that `tsconfig.json` includes. That tsconfig includes all of `src/`, so since PR 3 the published `dist/` has held `test.d.ts` and `dom-test.d.ts` for every module, plus `test-utils/` (open question 6, raised in PR 5). Nothing imports them, but they ship in the package. Options considered: a build-only tsconfig that leaves the tests out; deleting the files after the build; or keeping them.

## Decision
- `tsconfig.build.json` extends `tsconfig.json` and excludes `src/**/test.ts`, `src/**/dom-test.ts` and `src/test-utils`.
- `rslib.config.ts` sets `source.tsconfigPath` to it. Rstest extends the Rslib config, so it uses the same file. Excluding files changes only what gets declarations, not how modules resolve.
- `tsconfig.json` still includes everything, so `pnpm typecheck` checks the tests.

## Consequences
- `dist/` holds declarations only for the library code.
- A new test-only file name or folder has to be added to the exclude list, or its declarations ship again.
