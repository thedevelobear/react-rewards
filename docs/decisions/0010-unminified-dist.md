# 0010. The published build is not minified

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
v2.1.0 shipped a minified `dist/`. Rslib does not minify libraries by default, and PR 1 kept that default. PR 1 measured `dist/index.js` at 15.2 kB (4.2 kB gzipped) unminified and 3.69 kB gzipped when minified. v2.1.0 was 3.72 kB. Open question 5 asked whether the published build should be minified again.

Consumers' bundlers minify the library anyway. Unminified output gives readable stack traces and readable code in `node_modules`.

## Decision
- `dist/` is published unminified. `rslib.config.ts` does not set `output.minify`.
- Size is measured the way consumers ship it: bundled, minified and gzipped by size-limit ([ADR 0013](0013-size-limit-report-only.md)), not as the size of the file in the tarball.

## Consequences
- The tarball and the unpacked size on npm are larger than v2's. They are not the numbers to compare. size-limit's number is.
- A consumer who ships without a minifier ships the larger file. No common setup does that.
- Turning minification on later is a one-line config change. It needs a new ADR.
