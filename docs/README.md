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
| [0008](decisions/0008-toolchain-version-pins.md) | Toolchain version pins (pnpm 12.15.0, Rslib 1.0.3), and how to run pnpm 12 | Accepted |
| [0009](decisions/0009-no-squash-merges.md) | v3 PRs are merged without squashing | Accepted |
| [0010](decisions/0010-unminified-dist.md) | The published build is not minified | Accepted |
| [0011](decisions/0011-node-26-in-ci.md) | CI runs on Node 26, and `.nvmrc` pins it | Accepted |
| [0012](decisions/0012-pass-with-no-tests-until-pr-3.md) | Rstest passes with no test files until PR 3 | Accepted |
| [0013](decisions/0013-size-limit-report-only.md) | size-limit reports the bundle size, with no budget | Accepted |

### Benchmarks
| Benchmark | What |
|---|---|
| [2026-10-22-v2-baseline](benchmarks/2026-10-22-v2-baseline.md) | v2.1.0 at 50, 500 and 2000 elements per effect. The reference point for the new engine. |

### Guides
None yet. `guides/adding-an-effect.md` arrives in PR 12.
