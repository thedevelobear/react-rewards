# 0003. v3 lands through an integration branch

- **Status:** Accepted. Work after the release set by [0056](0056-work-after-release-branches-off-master.md)
- **Date:** 2026-10-22

`feat/v3-scaffolding`, branched from `master` at `7a80bc7`, is v3's integration branch. Each PR is a `v3/NN-topic` branch merged into it. It merges into `master` once, at the 3.0.0 release.

**Why:** Some intermediate states can't be released. The v2 code is deleted before the new hook exists. `master` keeps serving 2.x until then.

**Consequences:** 2.x fixes can ship from `master` until the release, and are merged into the integration branch. CI runs on PRs into either branch.
