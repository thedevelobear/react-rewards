# 0049. The site deploys to GitHub Pages from the integration branch until the release

- **Status:** Accepted
- **Date:** 2026-10-23

- `.github/workflows/pages.yml` builds the library and the demo and deploys `demo/dist/`, on every push to `feat/v3-scaffolding`. The trigger moves to `master` at the release.
- One deployment runs at a time, and a newer push doesn't cancel it.
- Assets use `output.assetPrefix: 'auto'`, so the site works under `/react-rewards/` or any other path. `'./'` would break the stylesheet's font URLs.
- The fixture page is deployed, unlinked.

**Why:** v3 is reviewed on the live site before the release, while `master` still holds v2.

**Consequences:** Pages uses "GitHub Actions" as its source, and the `github-pages` environment must allow the deploying branch. The site shows v3 while npm still serves v2.
