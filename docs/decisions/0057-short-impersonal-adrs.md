# 0057. ADRs are short, and state the decision and its reason

- **Status:** Proposed
- **Date:** 2026-10-24

- An ADR is its title, status and date, then the decision, a **Why:** line, and **Consequences:** when they aren't obvious. A rejected option appears only when it explains the decision.
- ADRs and other docs state what was decided and why. They don't say who decided, asked or answered, or retell how a decision was reached.
- Docs and code comments don't say in which PR something happened. PR numbers appear only in a plan, whose progress table defines them and links each to its GitHub PR.
- As a one-time exception to [ADR 0002](0002-docs-as-decision-record.md)'s rule that merged ADRs aren't edited, ADRs 0001 to 0056 were rewritten this way before the 3.0.0 release, with their decisions unchanged, and the v3 plan was shortened.

**Why:** The record is read before every PR. The ADRs averaged about 280 words, mostly the history of how each decision was reached rather than the decision. A plan's PR number means nothing to someone reading outside that plan.

**Consequences:** The options weighed and the earlier wording are only in git.
