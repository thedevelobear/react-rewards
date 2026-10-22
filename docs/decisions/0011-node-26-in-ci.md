# 0011. CI runs on Node 26, and `.nvmrc` pins it

- **Status:** Accepted. The `actions/setup-node` bullet is superseded by [0014](0014-pnpm-setup-action.md).
- **Date:** 2026-10-22

## Context
Node runs only the toolchain: Biome, `tsc`, Rslib, Rstest, size-limit, publint and attw. The library itself runs in browsers. Rstest 0.12 needs Node `^20.19.0 || >=22.12.0`.

On 2026-10-22, Node 24 had been in maintenance since 2026-10-20, Node 26 was due to become LTS on 2026-10-28, and Node 22 is in maintenance until 2027-04-30. The maintainer's machine defaults to Node 26.12.1. PR 1 was verified on 24.11.0 and 26.12.1.

Options considered for open question 6:
- A matrix of 24 and 26, with no pin.
- Node 26 only, pinned in `.nvmrc`.
- A matrix of 22, 24 and 26, with no pin.

## Decision
- `.nvmrc` contains `26`.
- CI runs one job. `actions/setup-node` reads the version from `.nvmrc`, so it uses the latest 26.x.
- `package.json` has no `engines` field. In a browser library it would be shown to consumers and would mean nothing to them.

## Consequences
- Contributors who use nvm or fnm get Node 26 with `nvm use` (or automatically, if their shell is set up for it).
- CI does not catch toolchain breakage on Node 24 or 22.
- Moving to the next LTS line is a one-line change to `.nvmrc`. It needs a new ADR.
