# Agent instructions

react-rewards is a small React library of reward micro-interactions (confetti, emoji, balloons). Version 3 is a rewrite in progress.

## Before you start
1. Read [`docs/README.md`](docs/README.md), then the active plan it links to.
2. Check [`docs/decisions/`](docs/decisions/) for anything your change touches. Don't silently re-decide something recorded there. If a decision needs to change, propose a new ADR.

## While you work
- Record decisions and plan changes in `docs/`, in the same PR as the code: a new ADR for each decision, and an update to the active plan's progress table and to any section the work changes. Nothing that matters should live only in chat or in PR comments.
- If something is unclear, or the plan contradicts itself, ask the maintainer before deciding.
- Work lands as small PRs, one at a time. v3 PRs target the integration branch `feat/v3-scaffolding`, not `master`.

## Commands
The repo pins pnpm 12.15.0 in `packageManager`. A global pnpm 12, or pnpm 10.34.7 or later, runs it. Older pnpm versions and Corepack cannot ([ADR 0008](docs/decisions/0008-toolchain-version-pins.md)). If `pnpm` fails with `ERR_PNPM_NO_MATCHING_VERSION`, run `npx pnpm@12.15.0 <command>` or update the global pnpm.

| Command | What it does |
|---|---|
| `pnpm install` | Install dependencies. |
| `pnpm lint` | Biome: lint, import order and formatting check. Markdown is not formatted. |
| `pnpm format` | Biome: write formatting. |
| `pnpm typecheck` | TypeScript 7, no emit. |
| `pnpm build` | Rslib: ESM build and declarations into `dist/`. |
| `pnpm dev` | Rslib build in watch mode. |
