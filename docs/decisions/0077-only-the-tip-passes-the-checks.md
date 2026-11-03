# 0077. Only a branch's tip has to pass the checks

- **Status:** Proposed
- **Date:** 2026-11-03

- A branch's commits are small, focused steps, but only its tip has to build and pass the checks. Nothing requires or checks that each commit passes on its own, and no agent replays commits to find out. This supersedes the sentence of [ADR 0009](0009-no-squash-merges.md) that each commit builds and passes lint on its own. PRs still merge without squashing.
- A writing agent (the effect-creator, the developer, the release-manager) runs the fast checks for what it touched, such as lint, the type check and the related tests, once before it reports, not after each commit. qa runs every check once, on the tip.

**Why:** CI and qa check the tip, which is what merges. Running the checks after every commit repeated them, mostly for commits that change only docs, without catching anything the tip's checks miss.

**Consequences:** A commit in the middle of a branch may not build on its own, so `git bisect` can stop on one that doesn't, and reverting a single commit may need a fix after it.
