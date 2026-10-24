# 0058. The site's redesign lands on the integration branch before the release

- **Status:** Proposed
- **Date:** 2026-10-24

- The preview site's redesign is one more v3 PR, `v3/14-site-redesign`, branched from `feat/v3-scaffolding` and merged into it. It is the exception to [ADR 0056](0056-work-after-release-branches-off-master.md)'s rule that the integration branch takes no more work.
- The release steps in the v3 plan run after it merges, so `master` gets v3 and the redesigned site in one merge.

**Why:** `master` still holds v2 until the release, so work on the site can't branch from it, and the redesign should ship with 3.0.0 rather than after it.
