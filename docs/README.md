# docs

What happened in this repo and why, for people and coding agents. Start here, then read the active plan.

## Layout and rules
The layout and its rules are set in [ADR 0002](decisions/0002-docs-as-decision-record.md).

- `plans/` holds plans for multi-PR work, named `YYYY-MM-DD-topic.md`. A plan is a living document: each PR updates its progress table and any section the PR changes. A plan that is replaced wholesale stays unchanged, apart from a status line pointing at its successor.
- `decisions/` holds architecture decision records (ADRs), one decision per file, named `NNNN-topic.md`. An ADR is never edited after merge, except its status line. A changed decision gets a new ADR, and the old one is marked `Superseded by NNNN`.
- `benchmarks/` holds measured results, named `YYYY-MM-DD-topic.md`, each with the machine, the method and the harness used.
- `guides/` holds how-to documents for working in the repo.

A PR that makes or changes a decision adds the ADR and updates the active plan in the same PR.

### ADR template
```md
# NNNN. Title stating the decision

- **Status:** Proposed | Accepted | Superseded by [NNNN](NNNN-topic.md)
- **Date:** YYYY-MM-DD

## Context
What forced a decision: the problem, the constraints, the options considered.

## Decision
What was decided, specifically enough to check the code against.

## Consequences
What gets easier, what gets harder, and what has to happen next.
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
| [0002](decisions/0002-docs-as-decision-record.md) | docs/ is the decision record | Accepted |
| [0003](decisions/0003-integration-branch.md) | v3 lands through the `feat/v3-scaffolding` integration branch | Accepted |
| [0004](decisions/0004-esm-only-output.md) | Publish ESM only | Accepted |
| [0005](decisions/0005-effect-contract-scope.md) | The 3.0 effect contract has `spawn` and `update` only | Accepted |
| [0006](decisions/0006-bare-demo-as-e2e-target.md) | A bare `demo/` page is the browser-test target from PR 5 | Accepted |
| [0007](decisions/0007-no-rename-step.md) | No rename-only step for the v2 files | Accepted |
| [0008](decisions/0008-toolchain-version-pins.md) | Toolchain version pins (pnpm 12.15.0, Rslib 1.0.3), and how to run pnpm 12 | Accepted. CI bullet superseded by 0014 |
| [0009](decisions/0009-no-squash-merges.md) | v3 PRs are merged without squashing | Accepted |
| [0010](decisions/0010-unminified-dist.md) | The published build is not minified | Accepted |
| [0011](decisions/0011-node-26-in-ci.md) | CI runs on Node 26, and `.nvmrc` pins it | Accepted. `actions/setup-node` bullet superseded by 0014 |
| [0012](decisions/0012-pass-with-no-tests-until-pr-3.md) | Rstest passes with no test files until PR 3 | Accepted |
| [0013](decisions/0013-size-limit-report-only.md) | size-limit reports the bundle size, with no budget | Accepted |
| [0014](decisions/0014-pnpm-setup-action.md) | CI sets up pnpm and Node with `pnpm/setup` | Accepted |
| [0015](decisions/0015-exact-dependency-versions.md) | Dependencies use exact versions | Accepted |
| [0016](decisions/0016-keep-rstest.md) | Rstest stays the test runner | Accepted |
| [0017](decisions/0017-isolated-declarations.md) | `isolatedDeclarations` is on | Accepted |
| [0018](decisions/0018-core-simulation-module.md) | Particle stepping lives in `core/simulation/` | Accepted |
| [0019](decisions/0019-particle-contract.md) | Particle fields, units and stepping in the effect contract | Accepted. Sprite sources refined by 0020 |
| [0020](decisions/0020-sprite-sizes.md) | Sprite sources carry their size in CSS pixels | Accepted |
| [0021](decisions/0021-async-atlas.md) | The atlas loads sprites asynchronously, and a burst waits for them | Accepted |
| [0022](decisions/0022-happy-dom-tests.md) | Tests that need a DOM run in happy-dom, from PR 4 | Accepted |
| [0023](decisions/0023-fire-options-beside-config.md) | `fire()` takes burst options beside the effect's config | Accepted |
| [0024](decisions/0024-physical-config-units.md) | Effect configs use physical units | Accepted |
| [0025](decisions/0025-cancel-skips-on-complete.md) | `cancel()` doesn't call `onComplete`, and `finished` says how a burst ended | Accepted |
| [0026](decisions/0026-modernised-confetti.md) | Confetti is redesigned, not a copy of v2's look | Accepted |
| [0027](decisions/0027-react-demo-from-pr-5.md) | `demo/` is a React 19 and Rsbuild app from PR 5 | Accepted |
| [0028](decisions/0028-public-exports-from-pr-5.md) | The public exports after PR 5 | Accepted |
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

### Benchmarks
| Benchmark | What |
|---|---|
| [2026-10-22-v2-baseline](benchmarks/2026-10-22-v2-baseline.md) | v2.1.0 at 50, 500 and 2000 elements per effect. The reference point for the new engine. |

### Guides
None yet. `guides/adding-an-effect.md` arrives in PR 12.
