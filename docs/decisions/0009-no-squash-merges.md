# 0009. v3 PRs are merged without squashing

- **Status:** Accepted
- **Date:** 2026-10-22

PRs are merged with a merge commit or a rebase merge, never squashed. Each commit builds and passes lint on its own. The merge of `feat/v3-scaffolding` into `master` follows the same rule.

**Why:** Each step stays revertible on its own. PR 1 (#113) was squash-merged, and its four commits were restored by a force-push.
