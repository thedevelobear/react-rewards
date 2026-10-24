# 0015. Dependencies use exact versions

- **Status:** Accepted
- **Date:** 2026-10-22

Every entry in `dependencies` and `devDependencies`, in the root and in `demo/`, uses an exact version. `pnpm-workspace.yaml` sets `saveExact: true`, so `pnpm add` writes them that way. `peerDependencies` stay ranges (`react >=18`).

**Why:** `package.json` then states what runs, and upgrading a direct dependency is always a deliberate change. The lockfile alone moves a range whenever it is regenerated. Pinning a peer dependency would force consumers onto one React version.

**Consequences:** pnpm 12 reads `saveExact` only from `pnpm-workspace.yaml`, not from `.npmrc`. Transitive dependencies are pinned only by the lockfile.
