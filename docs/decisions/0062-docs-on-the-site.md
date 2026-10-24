# 0062. The site holds the docs, and the README keeps the basics

- **Status:** Accepted
- **Date:** 2026-10-24

- The root README keeps the logo, the features, the introduction, the install command, one usage example, links to the site's pages, contributing and the licence.
- The library's documentation is on the site, as articles: `useReward` (its arguments, settings, burst options and return value), `fire`, the renderers and `setRenderer`, custom effects, server rendering, and upgrading from v2. The site's pages are described in [`demo/README.md`](../../demo/README.md), "Articles".
- The table of each effect's defaults is generated from the effects, not written by hand.
- `CHANGELOG.md` links to the site's upgrade page.
- `package.json`'s `homepage` is the site, so npm links to the docs. `repository` still links to GitHub.
- `docs/` stays the record for contributors: plans, ADRs, benchmarks and guides.

**Why:** The README and the site said the same things, and the README's copy of the defaults had drifted from the code. One copy, next to the live effects, is easier to keep right.

**Consequences:** A change to the public API updates its article in the same PR. npm shows only the basics, with links to the site.
