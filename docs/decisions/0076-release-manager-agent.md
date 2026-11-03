# 0076. A release-manager agent runs releases up to a draft GitHub release

- **Status:** Proposed
- **Date:** 2026-11-03

- A fifth agent, `release-manager` in `.claude/agents/`, joins those of [ADR 0064](0064-orchestrated-agents.md). It owns the `version` field in `package.json`, `CHANGELOG.md`, release branches (`chore/release-X.Y.Z`, made from `origin/master` with `--no-track`), draft GitHub releases, and the check after a publish. It follows `docs/guides/releasing.md`.
- It recommends a release's version with its evidence: the commits, merged PRs and API report diff since the last tag, and the rule of [ADR 0075](0075-versioning-policy.md) that sets each change's level. It writes the CHANGELOG entry, which is also the release's notes, from that history. Once the maintainer confirms the version, it writes the release branch's commits. It also answers versioning and CHANGELOG questions, such as what went into a version. It doesn't review commits against the repo's conventions, such as their messages, which other tools can check.
- After the release PR merges, and when asked, it drafts the GitHub release `vX.Y.Z` on the merge commit, with the CHANGELOG entry as its notes. A draft has no tag and runs no workflow, and only the maintainer publishes it. Afterwards, when asked, it checks the publish workflow's run and the version, its provenance and `latest` on npm.
- It never publishes a release, creates, moves or deletes a tag, pushes, opens a PR unless the maintainer asked, or rewrites history. A version that the policy doesn't settle comes back as an open question. Work outside what it owns, such as an upgrade article for a major, goes to the developer in a "Handoff to the developer" section.
- The orchestrator sends it releases, and questions about versions and the CHANGELOG, and has qa check a release branch. qa names it as the owner of failures in the version or the CHANGELOG.

**Why:** Most of a release is gathering evidence and writing two files, which an agent does well. Publishing can't be undone, since npm never takes the same version twice, so it stays with the maintainer, who sees the draft's notes and the evidence before pressing Publish.

**Consequences:** Every release needs the maintainer twice: to confirm the version, and to publish the draft.
