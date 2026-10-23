# Agent instructions

react-rewards is a small React library of reward micro-interactions (confetti, emoji, balloons). Version 3 is a rewrite in progress.

## Before you start
1. Read [`docs/README.md`](docs/README.md), then the active plan it links to.
2. Check [`docs/decisions/`](docs/decisions/) for anything your change touches. Don't silently re-decide something recorded there. If a decision needs to change, propose a new ADR.

## Picking up the next PR
Each PR in the plan's progress table is usually done in a fresh session. To continue:
1. Run `git fetch`. Find the first PR in the progress table that isn't merged.
2. If its branch (`v3/NN-topic`) exists, continue on it. Otherwise create it from the integration branch without tracking it:
   ```sh
   git switch --no-track -c v3/NN-topic origin/feat/v3-scaffolding
   ```
   Without `--no-track`, git makes `feat/v3-scaffolding` the branch's upstream. A plain push, including VS Code's Push button, then lands the commits on the integration branch with no PR. When the maintainer asks for a push, use `git push -u origin v3/NN-topic`.
3. If the previous PR is merged but still listed as "In review", mark it "Merged" with its PR number, and set any ADR it left as "Proposed" to "Accepted" (unless the maintainer changed it). Do this in the first commit of the new branch.
4. Before writing code, ask the maintainer the open questions the plan assigns to this PR. Record each answer as an ADR, and remove the question from the table.
5. When the PR is done, set its status to "In review", stop, and report to the maintainer. Don't push branches or open PRs unless the maintainer asks.

Fixes to a merged PR go on a `v3/fix-topic` branch, created and pushed the same way as in step 2. They take no number. List them in the plan's "Follow-up fixes" table, not in the progress table.

## While you work
- Record decisions and plan changes in `docs/`, in the same PR as the code: a new ADR for each decision, and an update to the active plan's progress table and to any section the work changes. Nothing that matters should live only in chat or in PR comments.
- If something is unclear, or the plan contradicts itself, ask the maintainer before deciding.
- Work lands as small PRs, one at a time. v3 PRs target the integration branch `feat/v3-scaffolding`, not `master`.
- PRs are merged without squashing ([ADR 0009](docs/decisions/0009-no-squash-merges.md)). Make every commit a self-contained step that builds and passes lint.
- Dependencies use exact versions, and `pnpm add` writes them that way. Peer dependencies stay ranges ([ADR 0015](docs/decisions/0015-exact-dependency-versions.md)).

## Commands
The repo pins pnpm 12.15.0 in `packageManager`. A global pnpm 12, or pnpm 10.34.7 or later, runs it. Older pnpm versions and Corepack cannot ([ADR 0008](docs/decisions/0008-toolchain-version-pins.md)). If `pnpm` fails with `ERR_PNPM_NO_MATCHING_VERSION`, run `npx pnpm@12.15.0 <command>` or update the global pnpm.

Use Node 26, as pinned in `.nvmrc`. CI runs on the same version ([ADR 0011](docs/decisions/0011-node-26-in-ci.md)).

| Command | What it does |
|---|---|
| `pnpm install` | Install dependencies. |
| `pnpm lint` | Biome: lint, import order and formatting check. Markdown is not formatted. |
| `pnpm format` | Biome: write formatting. |
| `pnpm typecheck` | TypeScript 7, no emit. |
| `pnpm test` | Rstest: `src/**/test.ts` in Node, and `src/**/dom-test.ts` in happy-dom ([ADR 0022](docs/decisions/0022-happy-dom-tests.md)). |
| `pnpm build` | Rslib: ESM build and declarations into `dist/`. |
| `pnpm dev` | Rslib build in watch mode. |
| `pnpm lint:package` | publint and attw (`--profile esm-only`) on the packed package. Run `pnpm build` first. |
| `pnpm size` | size-limit: the minified, gzipped size of `dist/index.js`, without React. Reports only, no budget ([ADR 0013](docs/decisions/0013-size-limit-report-only.md)). Run `pnpm build` first. |
| `pnpm e2e` | Builds the library and `demo/`, then runs the Playwright specs in headless Chromium, against the site and the fixture page ([ADR 0006](docs/decisions/0006-bare-demo-as-e2e-target.md), [ADR 0045](docs/decisions/0045-fixture-page.md)). Install the browser once with `pnpm --filter demo exec playwright install chromium`. |
| `pnpm --filter demo dev` | The demo's dev server: the site at `/`, and the browser-test fixtures at `/fixtures.html` ([ADR 0045](docs/decisions/0045-fixture-page.md)). The demo uses the built package, so run `pnpm dev` next to it ([ADR 0031](docs/decisions/0031-demo-imports-built-package.md)). |
| `pnpm --filter demo typecheck` | Type-checks `demo/` against the built declarations. Run `pnpm build` first. |
