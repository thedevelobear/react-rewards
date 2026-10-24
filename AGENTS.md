# Agent instructions

react-rewards is a small React library of reward micro-interactions (confetti, emoji, balloons). Version 3 is a rewrite around a particle engine, built PR by PR in the [v3 plan](docs/plans/2026-10-22-v3-rewrite.md).

## Before you start
1. Read [`docs/README.md`](docs/README.md), then the active plan it links to, if there is one.
2. Check [`docs/decisions/`](docs/decisions/) for anything your change touches. Don't silently re-decide something recorded there. If a decision needs to change, propose a new ADR. For the preview site, also read [`demo/README.md`](demo/README.md).

## Starting a branch
Every change is a branch made from `master`, merged into it through a PR ([ADR 0056](docs/decisions/0056-work-after-release-branches-off-master.md)).
1. Run `git fetch`. If your work already has a branch, continue on it. Otherwise create one from `master` without tracking it, named after the change's main commit type and its topic:
   ```sh
   git switch --no-track -c feat/topic origin/master
   ```
   Without `--no-track`, git makes `master` the branch's upstream. A plain push, including VS Code's Push button, then lands the commits on `master` with no PR. When the maintainer asks for a push, use `git push -u origin feat/topic`.
2. Bring the docs up to date with what has merged, in the first commit of the new branch. Set any ADR left as "Proposed" by a merged PR to "Accepted" (unless the maintainer changed it). If a plan lists a merged PR as "In review", mark it "Merged" with its PR number. If that was the plan's last PR, mark the plan done.
3. When the work is done, stop and report to the maintainer. Don't push branches or open PRs unless the maintainer asks.

## Work over several PRs
Work too big for one PR gets a plan in `docs/plans/`, with a progress table, as v3 did. Each PR in the table is usually done in a fresh session:
1. Find the first PR in the progress table that isn't merged, and start or continue its branch as above.
2. Before writing code, ask the maintainer the open questions the plan assigns to this PR. Record each answer as an ADR (or in `demo/README.md`, if it is about the site's design), and remove the question from the table.
3. When the PR is done, set its status to "In review".

Fixes to a merged PR of a plan take no number. List them in the plan's "Follow-up fixes" table, not in the progress table.

## Releasing
A release PR bumps the version in `package.json` and adds an entry to `CHANGELOG.md`. Once it merges, the maintainer publishes a GitHub release tagged `v` and the version, and a workflow publishes the package to npm ([ADR 0054](docs/decisions/0054-publish-from-github-release.md)).

## While you work
- Record decisions and plan changes in `docs/`, in the same PR as the code: a new ADR for each decision, and an update to the active plan's progress table and to any section the work changes. Nothing that matters should live only in chat or in PR comments.
- ADRs and docs state what was decided and why, briefly. They don't say who decided or asked, or retell how a decision was reached ([ADR 0057](docs/decisions/0057-short-impersonal-adrs.md)).
- ADRs are for the library: its API, engine, build and tests, and the repo's process. Decisions about the preview site's design and content go in `demo/README.md`, edited in place, not in ADRs ([ADR 0046](docs/decisions/0046-adrs-cover-the-library.md)). How the library is tested in a browser, and how `demo/` builds against it, are still ADRs.
- If something is unclear, or the plan contradicts itself, ask the maintainer before deciding.
- Work lands as small PRs into `master`, one at a time.
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
| `pnpm size` | size-limit: the minified, gzipped size of `dist/index.js`, and of `useReward` with each effect, without React. Reports only, no budget ([ADR 0013](docs/decisions/0013-size-limit-report-only.md), [ADR 0055](docs/decisions/0055-pure-effect-definitions.md)). Run `pnpm build` first. |
| `pnpm e2e` | Builds the library and `demo/`, then runs the Playwright specs in headless Chromium, against the site and the fixture page ([ADR 0006](docs/decisions/0006-bare-demo-as-e2e-target.md), [ADR 0045](docs/decisions/0045-fixture-page.md)). Install the browser once with `pnpm --filter demo exec playwright install chromium`. |
| `pnpm bench [reps]` | Builds the library and `demo/`, then runs the benchmark harness: every effect at 500, 5000 and 20000 particles, on each renderer, in a headed Chromium driving the site's Stress test page. It prints the table for `docs/benchmarks/`. Keep the window uncovered. Not run in CI ([ADR 0048](docs/decisions/0048-benchmark-script-in-demo.md)). |
| `pnpm --filter demo dev` | The demo's dev server: the site at `/`, and the browser-test fixtures at `/fixtures.html` ([ADR 0045](docs/decisions/0045-fixture-page.md)). The demo uses the built package, so run `pnpm dev` next to it ([ADR 0031](docs/decisions/0031-demo-imports-built-package.md)). |
| `pnpm --filter demo typecheck` | Type-checks `demo/` against the built declarations. Run `pnpm build` first. |
