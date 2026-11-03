# 0074. API Extractor keeps a report of the public API, and CI fails when it is stale

- **Status:** Proposed
- **Date:** 2026-11-03

- `@microsoft/api-extractor` is a dev dependency. `api-extractor.json` reads `dist/index.d.ts` and writes only the API report, `etc/react-rewards.api.md`, which is committed. There is no declaration rollup, doc model or `tsdoc-metadata.json`, so `dist/` doesn't change. The published `package.json` gains only the two scripts and the dev dependency. The report's working copy goes in `node_modules/.cache/api-extractor/`.
- `pnpm api:report` (`api-extractor run --local`) rewrites the report. `pnpm api:check` fails when the committed report differs from the built declarations, and prints the difference. Both read `dist/`, so `pnpm build` comes first. CI runs `pnpm api:check` after the build.
- Every export is public, and the source has no release tags, so `ae-missing-release-tag` is off. Types that public signatures use but the entry doesn't export, such as `Point` ([ADR 0053](0053-public-math-helpers.md)), are written into the report without `export` (`includeForgottenExports`), and `ae-forgotten-export` is off. Every other message is a warning, which fails the check.
- A PR that changes what `src/index.ts` exports, or a public type, updates the report in the same PR.

**Why:** The report shows each change to the public API as a diff in the PR that makes it, and the diff since the last tag shows what a release changed. Reading the built declarations checks what is published.

**Consequences:** API Extractor analyses with its own TypeScript, 6.0.3 in 7.60.1, and the compiler options in `tsconfig.json`. An option or declaration syntax that only TypeScript 7 knows would stop it, until API Extractor catches up or `compiler.overrideTsconfig` works around it. Doc comments aren't in the report, except those inside a type literal, but a member without one is marked `(undocumented)`, so adding a member's first doc comment changes the report.
