# 0014. CI sets up pnpm and Node with `pnpm/setup`

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
[ADR 0008](0008-toolchain-version-pins.md) has CI install pnpm with `pnpm/action-setup`, and [ADR 0011](0011-node-26-in-ci.md) has `actions/setup-node` read Node from `.nvmrc`. A third step then ran `pnpm install --frozen-lockfile`. `pnpm/action-setup` 6.1.0 supports pnpm 12, but its README points to a successor, `pnpm/setup`. After PR 2 merged, the maintainer asked to use the successor.

`pnpm/setup` v3 (3.1.1 on 2026-10-22):
- downloads pnpm's standalone binary from the npm registry and verifies it against npm's signature;
- reads the pnpm version from `packageManager` when `version` is not set;
- installs Node from a version file (`node-version-file`, or `.node-version`, `.nvmrc` and `.tool-versions` detected automatically);
- caches the pnpm store with `cache: true`;
- runs `pnpm install` itself, with `--frozen-lockfile` when `require-lockfile: true`.

## Decision
- CI uses one `pnpm/setup@v3` step with `node-version-file: .nvmrc`, `cache: true` and `require-lockfile: true`.
- It replaces `pnpm/action-setup`, `actions/setup-node` and the separate install step.
- This supersedes the CI bullet of ADR 0008 and the `actions/setup-node` bullet of ADR 0011. The rest of both stays: pnpm 12.15.0 is pinned in `packageManager`, Corepack is not supported, and Node 26 is pinned in `.nvmrc`.

## Consequences
- The workflow has one setup step instead of three, and the pnpm and Node versions still come from `packageManager` and `.nvmrc`.
- The install's output appears under the setup step in the CI log.
- CI fails if `pnpm-lock.yaml` is missing or out of date.
- If `pnpm/setup` breaks, the fallback is the two-action setup from PR 2 plus an explicit install step.
