# 0008. Toolchain version pins

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
- The original plan set `"packageManager": "pnpm@12.x"`. Corepack and pnpm accept only an exact version in that field. The latest pnpm 12 on 2026-10-22 is 12.15.0.
- The latest `@rslib/core` is 1.0.4, and it depends on `@rsbuild/core ~2.3.0-beta.0`, a prerelease. `@rslib/core` 1.0.3 depends on `@rsbuild/core ~2.2.11`, which matches the stable 2.2.14 that the demo will use.

## Decision
- `"packageManager": "pnpm@12.15.0"`. A machine with an older global pnpm (9.7 or later) switches to the pinned version on its own, because `manage-package-manager-versions` is on by default. No global install is needed.
- `@rslib/core` is pinned to `1.0.3`. Move to a newer version once a release depends on a stable `@rsbuild/core`.

## Consequences
- The library and the demo share one stable Rsbuild line.
- These pins are checked again before the 3.0.0 release (PR 12).
