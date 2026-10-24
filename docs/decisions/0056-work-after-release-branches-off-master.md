# 0056. After 3.0.0, work branches off `master`

- **Status:** Accepted
- **Date:** 2026-10-24

- From the release on, each change is a branch made from `origin/master` with `--no-track`, merged into `master` through a PR. The integration branch takes no more work, and it and the `v3/*` branches can be deleted once 3.0.0 is published.
- A branch is named after its main commit type and its topic, such as `feat/topic` or `fix/topic`.
- Work over several PRs gets a plan in `docs/plans/`. The docs rules and merges without squashing still apply.
- CI runs on pushes to `master` and on every PR.

**Why:** v3 needed an integration branch only because its intermediate states couldn't be released ([ADR 0003](0003-integration-branch.md)). After the release, `master` is v3.

**Consequences:** Between this ADR's merge and the release, `AGENTS.md` points at `master` while it still holds v2, so no work starts then. A 2.x fix would need a branch from the `v2.1.0` tag and a new ADR, because the publish workflow puts every release on `latest`.
