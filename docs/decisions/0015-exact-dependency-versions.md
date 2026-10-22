# 0015. Dependencies use exact versions

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
After PR 2, three devDependencies still used caret ranges: `@types/react ^19.3.0`, `react ^19.3.1` and `typescript ^7.0.2`. The maintainer wants exact versions so that packages cannot update silently.

The lockfile already prevents silent updates on install: `pnpm-lock.yaml` records the exact version of every package, including transitive ones, and CI installs with `--frozen-lockfile`. A range only moves when the lockfile is regenerated, for example by `pnpm update`, `pnpm add` or resolving a lockfile conflict. Exact versions still make `package.json` state what runs, and make every upgrade of a direct dependency a deliberate change.

pnpm 12 reads `saveExact` from `pnpm-workspace.yaml`. It ignores `save-exact` in `.npmrc`, which is also git-ignored in this repo. Both were tested with pnpm 12.15.0.

## Decision
- Every entry in `devDependencies` and `dependencies` uses an exact version, including in `demo/` once it exists. The three caret ranges are pinned to the versions already in the lockfile.
- `pnpm-workspace.yaml` sets `saveExact: true`, so `pnpm add` writes exact versions.
- `peerDependencies` stay ranges (`react >=18`). Pinning them would force consumers onto one React version.

## Consequences
- An upgrade is an explicit change to `package.json`, such as `pnpm add -D typescript@7.0.3`.
- Transitive dependencies keep the ranges their packages declare. Only the lockfile pins them, so lockfile changes in a PR still need a look.
- `pnpm-workspace.yaml` now exists with settings only. PR 5 adds the `demo/` workspace member to it.
