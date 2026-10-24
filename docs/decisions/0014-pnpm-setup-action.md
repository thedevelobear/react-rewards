# 0014. CI sets up pnpm and Node with `pnpm/setup`

- **Status:** Accepted
- **Date:** 2026-10-22

CI uses one `pnpm/setup@v3` step, with `node-version-file: .nvmrc`, `cache: true` and `require-lockfile: true`, which also runs the frozen install. It replaces `pnpm/action-setup`, `actions/setup-node` and the separate install step. The versions still come from `packageManager` and `.nvmrc`.

**Why:** `pnpm/setup` is the successor that `pnpm/action-setup`'s README points to. It verifies pnpm's binary against npm's signature, and does in one step what took three.

**Consequences:** CI fails when `pnpm-lock.yaml` is missing or out of date.
