# 0046. ADRs record the library, and the site's design lives in `demo/README.md`

- **Status:** Accepted
- **Date:** 2026-10-23

- ADRs record decisions about the library: its API, engine, build and tests, and the repo's process, including how the library is tested in a browser and how `demo/` builds against it.
- Decisions about the preview site's design and content are written in [`demo/README.md`](../../demo/README.md), each with its reason, and edited in place.
- The site ADRs once numbered 0046 to 0055 were deleted, as a one-time exception to [ADR 0002](0002-docs-as-decision-record.md), and their numbers reused from this ADR on. Commits before this ADR use those numbers for the deleted ADRs.

**Why:** The site exists to document the library, and its design doesn't constrain it. Site ADRs crowded the record that is read before every PR.

**Consequences:** The site's decisions have no history apart from git.
