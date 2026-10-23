# 0046. ADRs record the library, and the site's design lives in `demo/README.md`

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
[ADR 0002](0002-docs-as-decision-record.md) records every decision as an ADR. PRs 9 and 10 recorded the preview site's design the same way, in ten ADRs numbered 0046 to 0055: the hash routing, the logo, the sidebar's active item, the title's band, the replay button, the Preview and Code tabs, the list controls, the code colours, the props table and the Getting started page.

The site exists to document the library. Its design doesn't constrain the library, and its ADRs crowded the record that is read before every PR. The maintainer hadn't meant ADR 0002 to cover the site, and hadn't said so when the rules were written.

## Decision
- ADRs record decisions about the library: its API, engine, build and tests, and the repo's process. That includes how the library is tested in a browser and how `demo/` builds against the package, as in ADRs [0006](0006-bare-demo-as-e2e-target.md), [0027](0027-react-demo-from-pr-5.md), [0031](0031-demo-imports-built-package.md), [0035](0035-parity-diff-with-pixelmatch.md) and [0045](0045-fixture-page.md).
- Decisions about the preview site's design and content are written in [`demo/README.md`](../../demo/README.md), each with its reason. They are edited in place when the site changes, in the same PR.
- As a one-time exception to ADR 0002's rule that merged ADRs are never edited, the site ADRs 0046 to 0055 were deleted, and their decisions moved to `demo/README.md`. 0046 to 0050 had merged with PR 9 ([#122](https://github.com/thedevelobear/react-rewards/pull/122)). 0051 to 0055 belonged to PR 10, which hadn't merged. The code and the plan now point to the README instead.
- The freed numbers are reused, starting with this ADR. Commits and PRs from before this ADR, including #122, use 0046 to 0055 for the deleted site ADRs.
- `AGENTS.md` and `docs/README.md` state the split.

## Consequences
- The decision record is about the library only.
- The site's decisions have no history of their own, apart from git. `demo/README.md` shows the current design, and the options that were weighed are gone.
- Before changing the site, read `demo/README.md` as well as the ADRs.
- A link to one of the old numbers, in an old commit or PR, now leads to a different decision.
