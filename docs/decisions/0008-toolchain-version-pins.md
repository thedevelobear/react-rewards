# 0008. Toolchain version pins

- **Status:** Accepted. The CI bullet is superseded by [0014](0014-pnpm-setup-action.md).
- **Date:** 2026-10-22

- `"packageManager": "pnpm@12.15.0"`. Contributors need a global pnpm 12, or pnpm 10.34.7 or later, which switches to it. Corepack isn't supported.
- CI installs pnpm with `pnpm/action-setup`.
- `@rslib/core` is pinned to 1.0.3 until a release depends on a stable `@rsbuild/core`.

**Why:** `packageManager` takes an exact version. pnpm 12 renamed its platform binaries, so pnpm 10 before 10.34.7 fails with `ERR_PNPM_NO_MATCHING_VERSION`, and Corepack (Node 24.11.0) can't run it. `@rslib/core` 1.0.4 depends on a prerelease of `@rsbuild/core`, while 1.0.3 matches the demo's stable 2.2 line.

**Consequences:** Tools that call the global `pnpm` fail the same way on an older one. `publint --pack npm` works around it. A dependency's build script must be approved under `allowBuilds` in `pnpm-workspace.yaml`, or the install fails.
