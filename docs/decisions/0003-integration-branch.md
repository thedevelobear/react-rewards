# 0003. v3 lands through an integration branch

- **Status:** Accepted. Work after the release set by [0056](0056-work-after-release-branches-off-master.md)
- **Date:** 2026-10-22

## Context
The rewrite is split into a dozen PRs that the maintainer tests and merges one at a time. Some intermediate states are not releasable. For example, PR 5 deletes the v2 code before PR 8 adds the new hook. `master` holds the published 2.x line, which CJS users and anyone on React below 18 stay on.

## Decision
- `feat/v3-scaffolding` is the integration branch. It was created from `master` at `7a80bc7`.
- Each PR is a branch named `v3/NN-topic`, made from the integration branch and merged back into it.
- The integration branch merges into `master` once, when 3.0.0 is released.
- The original plan named the branch `v3-rewrite`. The maintainer chose to reuse the existing `feat/v3-scaffolding` instead.

## Consequences
- `master` stays a working v2 until the release, so 2.x fixes can be made and published from it.
- Fixes made on `master` in the meantime have to be merged into the integration branch.
- CI has to run on PRs that target the integration branch, not only on PRs that target `master`.
