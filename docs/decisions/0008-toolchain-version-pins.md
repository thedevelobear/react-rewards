# 0008. Toolchain version pins

- **Status:** Accepted. The CI bullet is superseded by [0014](0014-pnpm-setup-action.md).
- **Date:** 2026-10-22

## Context
- The original plan set `"packageManager": "pnpm@12.x"`. Corepack and pnpm accept only an exact version in that field. The latest pnpm 12 on 2026-10-22 is 12.15.0.
- pnpm 12 publishes its platform binaries under new names (`@pnpm/exe.darwin-arm64` and so on, previously `@pnpm/macos-arm64`). That affects how other tools can obtain it:
  - The standalone pnpm 10.21.0 cannot switch to 12.15.0. Its `manage-package-manager-versions` feature looks for the old package name and fails with `ERR_PNPM_NO_MATCHING_VERSION`.
  - pnpm 10.34.7, the latest 10.x, switches without problems.
  - Corepack, as bundled with Node 24.11.0, cannot run pnpm 12 at all. It looks for `bin/pnpm.cjs`, which pnpm 12 no longer ships.
- The latest `@rslib/core` is 1.0.4, and it depends on `@rsbuild/core ~2.3.0-beta.0`, a prerelease. `@rslib/core` 1.0.3 depends on `@rsbuild/core ~2.2.11`, which matches the stable 2.2.14 that the demo will use.

## Decision
- `"packageManager": "pnpm@12.15.0"`.
- Contributors need a global pnpm that can run it: pnpm 12 itself, or pnpm 10.34.7 or later, which switches to the pinned version on its own. Corepack is not supported.
- CI installs pnpm with `pnpm/action-setup`, which reads `packageManager`, not with Corepack.
- `@rslib/core` is pinned to `1.0.3`. Move to a newer version once a release depends on a stable `@rsbuild/core`.

## Consequences
- An older global pnpm fails in this repo with `ERR_PNPM_NO_MATCHING_VERSION`. `AGENTS.md` names the fix.
- Tools that shell out to the global `pnpm` fail the same way on such a machine. For example, `publint` packs with `pnpm pack` by default; `publint --pack npm` works around it.
- pnpm 12 fails an install when a dependency's build script has not been approved. Approvals go in `pnpm-workspace.yaml` under `allowBuilds`. The current toolchain needs none.
- The library and the demo share one stable Rsbuild line.
- These pins are checked again before the 3.0.0 release (PR 12).
