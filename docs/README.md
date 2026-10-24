# docs

What happened in this repo and why, for people and coding agents. Start here, then read the active plan, if there is one.

## Layout and rules
The layout and its rules are set in [ADR 0002](decisions/0002-docs-as-decision-record.md).

- `plans/` holds plans for multi-PR work, named `YYYY-MM-DD-topic.md`. A plan is a living document: each PR updates its progress table and any section the PR changes. A plan that is replaced wholesale stays unchanged, apart from a status line pointing at its successor.
- `decisions/` holds architecture decision records (ADRs), one decision per file, named `NNNN-topic.md`. An ADR is never edited after merge, except its status line. A changed decision gets a new ADR, and the old one is marked `Superseded by NNNN`.
- `benchmarks/` holds measured results, named `YYYY-MM-DD-topic.md`, each with the machine, the method and the harness used.
- `guides/` holds how-to documents for working in the repo.

A PR that makes or changes a decision adds the ADR and updates the active plan in the same PR.

ADRs record decisions about the library: its API, engine, build and tests, and the repo's process. Decisions about the preview site's design and content are kept in [`demo/README.md`](../demo/README.md) instead, and edited in place ([ADR 0046](decisions/0046-adrs-cover-the-library.md)).

### ADR template
ADRs are short. They state what was decided and why, not who decided it, how, or in which PR ([ADR 0057](decisions/0057-short-impersonal-adrs.md)).

```md
# NNNN. Title stating the decision

- **Status:** Proposed | Accepted | Superseded by [NNNN](NNNN-topic.md)
- **Date:** YYYY-MM-DD

What was decided, specifically enough to check the code against.

**Why:** The reason, in a sentence or two.

**Consequences:** What gets harder, or has to happen next. Left out when obvious.
```

## Index

### Plans
| Plan | Status |
|---|---|
| [2026-10-22-v3-rewrite](plans/2026-10-22-v3-rewrite.md) | **Active**. The v3 rewrite, PR by PR. |
| [2026-10-21-toolchain-upgrade-and-preview-site](plans/2026-10-21-toolchain-upgrade-and-preview-site.md) | Superseded by 2026-10-22-v3-rewrite. The original proposal. |

### Decisions
| # | Decision | Status |
|---|---|---|
| [0001](decisions/0001-v3-direction.md) | v3 direction: toolchain, engine and API | Accepted |
| [0002](decisions/0002-docs-as-decision-record.md) | docs/ is the decision record | Accepted. Scope narrowed to the library by 0046. ADR format set by 0057 |
| [0003](decisions/0003-integration-branch.md) | v3 lands through the `feat/v3-scaffolding` integration branch | Accepted. Work after the release set by 0056 |
| [0004](decisions/0004-esm-only-output.md) | Publish ESM only | Accepted |
| [0005](decisions/0005-effect-contract-scope.md) | The 3.0 effect contract has `spawn` and `update` only | Accepted |
| [0006](decisions/0006-bare-demo-as-e2e-target.md) | A bare `demo/` page is the browser-test target | Accepted. The page the specs open is refined by 0045 |
| [0007](decisions/0007-no-rename-step.md) | No rename-only step for the v2 files | Accepted |
| [0008](decisions/0008-toolchain-version-pins.md) | Toolchain version pins (pnpm 12.15.0, Rslib 1.0.3), and how to run pnpm 12 | Accepted. CI bullet superseded by 0014 |
| [0009](decisions/0009-no-squash-merges.md) | v3 PRs are merged without squashing | Accepted |
| [0010](decisions/0010-unminified-dist.md) | The published build is not minified | Accepted |
| [0011](decisions/0011-node-26-in-ci.md) | CI runs on Node 26, and `.nvmrc` pins it | Accepted. `actions/setup-node` bullet superseded by 0014 |
| [0012](decisions/0012-pass-with-no-tests-until-first-test.md) | Rstest passes with no test files until the first test | Accepted |
| [0013](decisions/0013-size-limit-report-only.md) | size-limit reports the bundle size, with no budget | Accepted |
| [0014](decisions/0014-pnpm-setup-action.md) | CI sets up pnpm and Node with `pnpm/setup` | Accepted |
| [0015](decisions/0015-exact-dependency-versions.md) | Dependencies use exact versions | Accepted |
| [0016](decisions/0016-keep-rstest.md) | Rstest stays the test runner | Accepted |
| [0017](decisions/0017-isolated-declarations.md) | `isolatedDeclarations` is on | Accepted |
| [0018](decisions/0018-core-simulation-module.md) | Particle stepping lives in `core/simulation/` | Accepted |
| [0019](decisions/0019-particle-contract.md) | Particle fields, units and stepping in the effect contract | Accepted. Sprite sources refined by 0020 |
| [0020](decisions/0020-sprite-sizes.md) | Sprite sources carry their size in CSS pixels | Accepted |
| [0021](decisions/0021-async-atlas.md) | The atlas loads sprites asynchronously, and a burst waits for them | Accepted |
| [0022](decisions/0022-happy-dom-tests.md) | Tests that need a DOM run in happy-dom | Accepted |
| [0023](decisions/0023-fire-options-beside-config.md) | `fire()` takes burst options beside the effect's config | Accepted |
| [0024](decisions/0024-physical-config-units.md) | Effect configs use physical units | Accepted |
| [0025](decisions/0025-cancel-skips-on-complete.md) | `cancel()` doesn't call `onComplete`, and `finished` says how a burst ended | Accepted |
| [0026](decisions/0026-modernised-confetti.md) | Confetti is redesigned, not a copy of v2's look | Accepted. The fall reworked by 0059 |
| [0027](decisions/0027-react-demo.md) | `demo/` is a React 19 and Rsbuild app from the start | Accepted |
| [0028](decisions/0028-first-public-exports.md) | The first public exports are `fire`, `confetti` and `defineEffect` | Accepted. Math helpers bullet superseded by 0053 |
| [0029](decisions/0029-default-z-index.md) | The overlay's `zIndex` defaults to 2147483647 | Accepted |
| [0030](decisions/0030-effect-errors-swallowed.md) | Errors thrown by an effect are swallowed | Accepted |
| [0031](decisions/0031-demo-imports-built-package.md) | `demo/` imports the built package | Accepted |
| [0032](decisions/0032-build-tsconfig-without-tests.md) | The build leaves test declarations out of `dist/` | Accepted |
| [0033](decisions/0033-strict-public-set-renderer.md) | `setRenderer` is public, and a forced renderer never falls back | Accepted |
| [0034](decisions/0034-merge-neighbouring-batches.md) | WebGL merges only neighbouring batches with the same blend mode | Accepted |
| [0035](decisions/0035-parity-diff-with-pixelmatch.md) | The parity spec compares screenshots with pixelmatch | Accepted |
| [0036](decisions/0036-context-loss-replaces-canvas.md) | A lost WebGL context ends running bursts and replaces the canvas | Accepted |
| [0037](decisions/0037-balloon-effect-name.md) | The balloons effect is named `balloon` | Accepted |
| [0038](decisions/0038-modernised-emoji.md) | Emoji is redesigned, not a copy of v2's look | Accepted |
| [0039](decisions/0039-buoyant-balloon.md) | Balloons are redesigned, and rise by negative gravity | Accepted |
| [0040](decisions/0040-stable-reward.md) | `reward` is stable, and each call reads the latest arguments | Accepted |
| [0041](decisions/0041-hook-burst-options-argument.md) | The hook takes the burst options as a fourth argument | Accepted |
| [0042](decisions/0042-reward-returns-burst.md) | `reward()` returns the burst, and rewards stack | Accepted. Origin refined by 0044 |
| [0043](decisions/0043-hook-tests-with-testing-library.md) | The hook's tests use Testing Library | Accepted |
| [0044](decisions/0044-reward-handles-pointer-events.md) | `reward` passed as an event handler fires from the pointer | Accepted |
| [0045](decisions/0045-fixture-page.md) | The browser-test fixtures move to a second page, `fixtures.html` | Accepted |
| [0046](decisions/0046-adrs-cover-the-library.md) | ADRs record the library, and the site's design lives in `demo/README.md` | Accepted |
| [0047](decisions/0047-burst-renderer.md) | A burst says which renderer it was given | Accepted |
| [0048](decisions/0048-benchmark-script-in-demo.md) | The benchmark harness is a script in `demo/` | Accepted |
| [0049](decisions/0049-pages-deploy-from-integration-branch.md) | The site deploys to GitHub Pages from the integration branch until the release | Accepted |
| [0050](decisions/0050-no-canvas-particle-cap.md) | The Canvas 2D fallback has no particle cap | Accepted |
| [0051](decisions/0051-no-engine-optimisations-after-benchmark.md) | Off-screen culling and the particle view's accessors stay as they are | Accepted |
| [0052](decisions/0052-effects-generic-over-effect.md) | Any effect is an `Effect`, and `fire` and `useReward` are generic over the effect | Accepted |
| [0053](decisions/0053-public-math-helpers.md) | The math helpers are public | Accepted |
| [0054](decisions/0054-publish-from-github-release.md) | A GitHub release publishes to npm with trusted publishing, and v3 starts at 3.0.0 | Accepted |
| [0055](decisions/0055-pure-effect-definitions.md) | Built-in effects are marked pure, so unused ones tree-shake | Accepted |
| [0056](decisions/0056-work-after-release-branches-off-master.md) | After 3.0.0, work branches off `master` | Accepted. Two more PRs on the integration branch: 0058 and 0060 |
| [0057](decisions/0057-short-impersonal-adrs.md) | ADRs are short, and state the decision and its reason | Accepted |
| [0058](decisions/0058-site-redesign-before-the-release.md) | The site's redesign lands on the integration branch before the release, with the effect tweaks made while reviewing it | Accepted |
| [0059](decisions/0059-confetti-falls-like-paper.md) | Confetti eases into falling like paper | Accepted |
| [0060](decisions/0060-cleanup-before-the-release.md) | The docs, icon and type cleanup lands on the integration branch before the release | Proposed |

### Benchmarks
| Benchmark | What |
|---|---|
| [2026-10-22-v2-baseline](benchmarks/2026-10-22-v2-baseline.md) | v2.1.0 at 50, 500 and 2000 elements per effect. The reference point for the new engine. |
| [2026-10-23-v3-engine](benchmarks/2026-10-23-v3-engine.md) | The v3 engine at 500, 5000 and 20000 particles per effect, on WebGL and Canvas 2D. |

### Guides
| Guide | What |
|---|---|
| [adding-an-effect](guides/adding-an-effect.md) | Adding a built-in effect: the contract, the folder, the tests, the export and the site. |
