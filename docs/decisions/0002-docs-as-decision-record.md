# 0002. docs/ is the decision record

- **Status:** Accepted. Scope narrowed to the library by [0046](0046-adrs-cover-the-library.md). ADR format set by [0057](0057-short-impersonal-adrs.md)
- **Date:** 2026-10-22

`docs/` records what was decided and why, indexed by `docs/README.md`:
- `plans/`: plans for multi-PR work, `YYYY-MM-DD-topic.md`. Each PR updates the active plan. A replaced plan only gets a status line pointing at its successor.
- `decisions/`: one ADR per decision, `NNNN-topic.md`. After merge only the status line changes. A changed decision gets a new ADR that supersedes the old one.
- `benchmarks/`: measured results, `YYYY-MM-DD-topic.md`, with the machine, method and harness.
- `guides/`: how-to documents, kept current with the code.

A PR that makes a decision adds its ADR and updates the plan. `AGENTS.md`, which `CLAUDE.md` imports, points coding agents here.

**Why:** The work is spread over many PRs and sessions, some run by coding agents, and decisions left in chat or PR comments get lost.

**Consequences:** Every PR carries a docs diff for review. ADR numbers follow merge order.
