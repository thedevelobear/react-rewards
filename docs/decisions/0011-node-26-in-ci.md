# 0011. CI runs on Node 26, and `.nvmrc` pins it

- **Status:** Accepted. The `actions/setup-node` bullet is superseded by [0014](0014-pnpm-setup-action.md).
- **Date:** 2026-10-22

- `.nvmrc` contains `26`.
- CI runs one job, and `actions/setup-node` reads its version from `.nvmrc`.
- `package.json` has no `engines` field.

**Why:** Node runs only the toolchain, and the library runs in browsers, where `engines` means nothing to consumers. Node 26 becomes LTS on 2026-10-28, and `.nvmrc` gives contributors who use nvm or fnm the same version as CI.

**Consequences:** CI doesn't catch toolchain breakage on Node 24 or 22.
