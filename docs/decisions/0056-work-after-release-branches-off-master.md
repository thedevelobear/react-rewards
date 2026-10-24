# 0056. After 3.0.0, work branches off `master`

- **Status:** Proposed
- **Date:** 2026-10-24

## Context
v3 was built on the integration branch `feat/v3-scaffolding`, which merges into `master` once, at the release ([ADR 0003](0003-integration-branch.md)). ADR 0003 doesn't say how work runs after that. `AGENTS.md` tells agents to create `v3/NN-topic` branches from the integration branch, and CI runs on pushes to it.

PR 13 reaches `master` with the release, so whatever it leaves in `AGENTS.md` is what the next session reads. Options considered: set the process in PR 13, or leave it to a branch made from `master` after the release.

## Decision
- From the release on, `master` is the only long-lived branch. Each change is a branch made from `origin/master` with `--no-track`, merged into `master` through a PR. The integration branch takes no more work.
- A branch is named after its main commit type and its topic, such as `feat/topic` or `fix/topic`.
- Work that spans several PRs gets a plan in `docs/plans/`, with a progress table, as v3 did. A change that fits in one PR needs no plan.
- The docs rules ([ADR 0002](0002-docs-as-decision-record.md), [ADR 0046](0046-adrs-cover-the-library.md)) and merges without squashing ([ADR 0009](0009-no-squash-merges.md)) apply to PRs into `master` as they did to PRs into the integration branch.
- CI runs on pushes to `master` and on every PR. The push trigger for `feat/v3-scaffolding` is removed.
- Once 3.0.0 is published, `feat/v3-scaffolding` and the `v3/*` branches can be deleted. Their commits are in `master`, and their PRs stay on GitHub.
- `AGENTS.md` describes this process. The first branch made from `master` after the release marks PR 13 merged and the v3 plan done.

## Consequences
- Between PR 13's merge and the release, `AGENTS.md` points at `master`, which still holds v2. No work starts in that window.
- `master` no longer holds 2.x. A 2.x fix would need a branch made from the `v2.1.0` tag, and the publish workflow would put it on `latest` ([ADR 0054](0054-publish-from-github-release.md)), so it needs a new ADR first. None is planned.
- A release is still a PR that bumps the version and adds a `CHANGELOG.md` entry, followed by a GitHub release ([ADR 0054](0054-publish-from-github-release.md)).
