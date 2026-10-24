# 0060. The docs, icon and type cleanup lands on the integration branch before the release

- **Status:** Proposed
- **Date:** 2026-10-24

- One more v3 PR, `v3/15-docs-and-cleanup`, branched from `feat/v3-scaffolding` and merged into it. With [ADR 0058](0058-site-redesign-before-the-release.md), it is the second exception to [ADR 0056](0056-work-after-release-branches-off-master.md)'s rule that the integration branch takes no more work.
- It moves the README's reference to the site, keeps the site's icons in one place, moves types into `types.ts` files, and adds an agent for writing effects. It also gives the site a favicon and a card for shared links, so the site is ready to share when the release deploys it.
- The release steps in the v3 plan run after it merges.

**Why:** It changes the README, the site and the code layout that 3.0.0 ships with, and `master` still holds v2.
