# 0065. The publish workflow runs a pinned npm 11

- **Status:** Accepted
- **Date:** 2026-10-24

- `.github/workflows/publish.yml` publishes with `npx --yes npm@11.20.0 publish`, not `npm publish`. 11.20.0 is the npm bundled with the Node in `.nvmrc`.

**Why:** `pnpm/setup` installs Node without npm, so `npm` on the runner is the image's own, npm 10 on `ubuntu-24.04`. Trusted publishing needs npm 11.5.1 or later, and npm 10 fails with `ENEEDAUTH` ([ADR 0054](0054-publish-from-github-release.md)).

**Consequences:** The pin is updated by hand when `.nvmrc` moves to a Node with a newer npm. A release event runs the workflow from the tagged commit, so a tag made before this change has to be made again to publish.
