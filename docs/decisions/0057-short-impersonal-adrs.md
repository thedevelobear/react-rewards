# 0057. ADRs are short, and state the decision and its reason

- **Status:** Proposed
- **Date:** 2026-10-24

- An ADR is its title, status and date, then the decision, a **Why:** line, and **Consequences:** when they aren't obvious. A rejected option appears only when it explains the decision.
- ADRs and other docs state what was decided and why. They don't say who decided, asked or answered, or retell how a decision was reached.
- As a one-time exception to [ADR 0002](0002-docs-as-decision-record.md)'s rule that merged ADRs aren't edited, ADRs 0001 to 0056 were rewritten this way in PR 13, with their decisions unchanged. The v3 plan was shortened in the same PR.

**Why:** The record is read before every PR. The ADRs averaged about 280 words, mostly the history of how each decision was reached rather than the decision.

**Consequences:** The options weighed and the earlier wording are only in git.
