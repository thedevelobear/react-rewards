# 0009. v3 PRs are merged without squashing

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
The original plan made each step "its own commit or PR so any step can be reverted". PR 1 (#113) had four commits: docs, the baseline benchmark, the yarn-to-pnpm switch and the tooling migration. It was squash-merged into `feat/v3-scaffolding`, which collapsed them into one commit. The maintainer wanted the separate commits back. The branch was reset to the four original commits and force-pushed. The file contents were identical to the squash commit.

## Decision
- PRs into `feat/v3-scaffolding` are merged with a merge commit or a rebase merge, never squashed.
- Each commit in a PR is a self-contained step that builds and passes lint, so it can be reverted on its own.

## Consequences
- History on the integration branch shows every step, at the cost of more commits.
- PR authors keep their commits tidy before review. Fixups are squashed locally, before the PR is merged, not by the merge.
- The merge of `feat/v3-scaffolding` into `master` at release time follows the same rule.
