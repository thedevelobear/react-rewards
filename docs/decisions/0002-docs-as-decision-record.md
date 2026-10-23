# 0002. docs/ is the decision record

- **Status:** Accepted. Scope narrowed to the library by [0046](0046-adrs-cover-the-library.md)
- **Date:** 2026-10-22

## Context
The v3 rewrite is spread over many PRs and sessions, some of them run by coding agents. Decisions made in chat or in PR comments get lost. The maintainer wants anyone who arrives later, person or agent, to be able to find out what happened in the repo and why.

## Decision
`docs/` is an architecture decision record and a library, laid out like this:

| Folder | Holds | Rules |
|---|---|---|
| `plans/` | Plans for multi-PR work, named `YYYY-MM-DD-topic.md`. | Living documents. Each PR updates the active plan's progress table and any section its work changes. A plan that is replaced wholesale stays unchanged, apart from a status line pointing at its successor. |
| `decisions/` | ADRs, one decision per file, named `NNNN-topic.md`. | Never edited after merge except the status line. A changed decision gets a new ADR, and the old one is marked `Superseded by NNNN`. |
| `benchmarks/` | Measured results, named `YYYY-MM-DD-topic.md`. | Each records the machine, the method and the harness, so a later run can be compared with it. |
| `guides/` | How-to documents for working in the repo. | Kept current with the code. |

`docs/README.md` indexes everything and states these rules.

Every PR that makes or changes a decision adds the ADR and updates the plan in the same PR. Nothing that matters lives only in chat or in PR comments.

The root `AGENTS.md` tells coding agents to read `docs/README.md` first and to follow these rules. `CLAUDE.md` imports `AGENTS.md`, so Claude Code reads the same instructions.

## Consequences
- Every v3 PR includes a docs diff, which reviewers check along with the code.
- ADR numbers are assigned in merge order. PRs land one at a time, so numbers do not clash.
- The plan and the code can still drift if a PR forgets to update the plan. Review is the only check.
