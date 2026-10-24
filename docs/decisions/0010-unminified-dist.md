# 0010. The published build is not minified

- **Status:** Accepted
- **Date:** 2026-10-22

`dist/` is published unminified: `rslib.config.ts` doesn't set `output.minify`. Size is measured bundled, minified and gzipped by size-limit ([ADR 0013](0013-size-limit-report-only.md)), not as the file in the tarball.

**Why:** Consumers' bundlers minify the library anyway, and unminified code gives readable stack traces and a readable `node_modules`.

**Consequences:** The tarball is larger than v2's. size-limit's number is the one to compare.
