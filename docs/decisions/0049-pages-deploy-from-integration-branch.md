# 0049. The site deploys to GitHub Pages from the integration branch until the release

- **Status:** Proposed
- **Date:** 2026-10-23

## Context
PR 11 deploys `demo/` to GitHub Pages through Actions (plan, step 3), and its "How to test" is the deployed URL. Until the release, `master` holds v2, and v3 lives on `feat/v3-scaffolding` ([ADR 0003](0003-integration-branch.md)).

Options considered: deploy on every push to the integration branch, and move the trigger to `master` at the release; deploy from `master` only, so nothing is live until the release; or deploy only when the workflow is started by hand.

## Decision
- `.github/workflows/pages.yml` builds the library and the demo, and deploys `demo/dist/` with `actions/upload-pages-artifact` and `actions/deploy-pages`, on every push to `feat/v3-scaffolding`. It also accepts `workflow_dispatch`, but GitHub offers a manual run only for workflows on the default branch, so that works from the release on.
- It sets up pnpm and Node as CI does ([ADR 0014](0014-pnpm-setup-action.md)). It doesn't repeat CI's checks.
- One deployment runs at a time, and a newer push doesn't cancel one in progress.
- The demo's assets use relative URLs (`output.assetPrefix: 'auto'`), so the site works under the project path, `/react-rewards/`, and on any other host. The hash routing needs no base path ([demo README, Routing](../../demo/README.md#routing)). `'./'` isn't used: it gives the stylesheet font URLs such as `./static/font/…`, which resolve against the stylesheet's own folder, `static/css/`. `'auto'` writes `../../static/font/…` there, and was checked by serving the build under `/react-rewards/`.
- The fixture page is deployed too. The site doesn't link to it ([ADR 0045](0045-fixture-page.md)).
- PR 12 moves the trigger to `master`, when v3 merges into it.

## Consequences
- The maintainer enables Pages in the repository's settings, with "GitHub Actions" as the source, before the first deployment.
- GitHub's `github-pages` environment allows deployments from the default branch only, unless told otherwise. The maintainer adds `feat/v3-scaffolding` to its deployment branches, in Settings, Environments. PR 12 can remove it.
- The live site shows v3 before v3 is released, while npm still serves v2. The README links to the site only from PR 12.
- A push to the integration branch that breaks the demo's build fails the deployment, and the last good site stays up.
