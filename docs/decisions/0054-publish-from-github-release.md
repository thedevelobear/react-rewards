# 0054. A GitHub release publishes to npm with trusted publishing, and v3 starts at 3.0.0

- **Status:** Accepted
- **Date:** 2026-10-24

- `.github/workflows/publish.yml` runs when a GitHub release that isn't a pre-release is published. It sets up pnpm and Node as CI does, and fails unless the tag is `v` and the `package.json` version.
- It runs `npm publish`, which runs `prepublishOnly`, authenticated by trusted publishing (`id-token: write`), with no npm token.
- A release PR bumps the version and adds a `CHANGELOG.md` entry by hand. There are no Changesets.
- v3's first release is 3.0.0 on `latest`, published from `master` once `feat/v3-scaffolding` merges into it.

**Why:** Trusted publishing stores no npm token, and npm adds provenance to every version published that way.

**Consequences:** The workflow has to be added as a trusted publisher on npmjs.com before the first release. Pre-releases aren't published, and supporting one needs a new ADR.
