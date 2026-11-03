# 0009. v3 PRs are merged without squashing

- **Status:** Accepted. The rule that each commit builds on its own is superseded by [0077](0077-only-the-tip-passes-the-checks.md)
- **Date:** 2026-10-22

PRs are merged with a merge commit or a rebase merge, never squashed. Each commit builds and passes lint on its own. The merge of `feat/v3-scaffolding` into `master` follows the same rule.

**Why:** Each step stays revertible on its own, which a squash merge loses.
