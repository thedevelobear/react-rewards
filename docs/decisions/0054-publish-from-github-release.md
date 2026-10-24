# 0054. A GitHub release publishes to npm with trusted publishing, and v3 starts at 3.0.0

- **Status:** Proposed
- **Date:** 2026-10-24

## Context
v2 was published by hand from the maintainer's machine. The plan asked whether v3 should automate releases with Changesets and publish with npm provenance from GitHub Actions, or stay manual (open question 4). It also had to say how v3 first reaches npm.

npm's trusted publishing lets a GitHub Actions workflow publish over OIDC, with no npm token stored in the repository, and npm adds a provenance attestation to every package published that way.

Options considered:
- Changesets, whose PRs bump the version and write the changelog, and a workflow that publishes on merge to `master`.
- A workflow that publishes when a GitHub release is published, with the version and the changelog edited by hand.
- Manual `npm publish`, with no provenance.

For the first release: 3.0.0 straight to `latest`, or a release candidate under the `next` tag first.

## Decision
- `.github/workflows/publish.yml` runs when a GitHub release is published, and not for one marked as a pre-release.
- It sets up pnpm and Node as CI does ([ADR 0014](0014-pnpm-setup-action.md)), installs from the lockfile, and fails unless the release's tag is `v` followed by `package.json`'s version, as v2's tags are.
- It runs `npm publish`, which runs `prepublishOnly` (typecheck, tests and build). It authenticates with trusted publishing (`id-token: write`) and stores no npm token. npm needs version 11.5.1 or later for this, which Node 26 ships.
- No Changesets. A release PR bumps the version in `package.json` and adds an entry to `CHANGELOG.md`, by hand.
- v3's first release is 3.0.0, published to `latest`. PR 12 bumps the version. The maintainer then merges `feat/v3-scaffolding` into `master` ([ADR 0003](0003-integration-branch.md)) and publishes the GitHub release `v3.0.0` from `master`.

## Consequences
- Before the first release, the maintainer adds the workflow as a trusted publisher in the package's settings on npmjs.com (GitHub Actions, `thedevelobear/react-rewards`, `publish.yml`).
- Every version from 3.0.0 on carries provenance, so npm shows which commit and workflow built it.
- A release whose tag doesn't match the version fails before anything is published.
- A pre-release, such as a future `3.1.0-rc.0`, isn't published by the workflow. Supporting one means publishing it under the `next` tag, in a new ADR.
- The changelog is only as complete as the release PR makes it.
