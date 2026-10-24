# 0064. Claude Code works through an orchestrator agent, with an effect creator, a developer and QA

- **Status:** Proposed
- **Date:** 2026-10-24

- Four agents live in `.claude/agents/`:
  - `orchestrator` reads each request, asks the maintainer what only they can decide, sets up the branch, hands the work out, loops QA's failures back, and reports. It writes no code.
  - `effect-creator` does an effect's core work: its physics and equations, its folder in `src/effects/`, its tests and export, and any change to the engine in `src/core/` ([ADR 0063](0063-effect-creator-agent.md)).
  - `developer` does everything else: the library's other code, refactors, dependency and toolchain updates, docs and ADRs, and the site, including a new effect's page, icon, card drawing and articles.
  - `qa` runs every check: lint, types, unit tests, the build, the package checks, size against the base, the browser specs, the benchmark when the maintainer agrees, and a visual check of the site. It changes nothing.
- A new effect goes from the effect-creator to the developer, through the orchestrator, with the effect-creator's "Handoff to the developer" section passed on unchanged. Any other request goes to the developer. QA runs last. Its failures go back to the agent that owns them, for at most three rounds before the maintainer is asked.
- `.claude/settings.json` makes the orchestrator the session agent, so a Claude Code session in the repo starts with it. The other agents are subagents. Their descriptions say to start with the orchestrator, and they can't start agents themselves.
- Subagents can't ask the maintainer questions, so they return them, and the orchestrator asks.

**Why:** Each kind of work goes to the agent that knows it, the maintainer keeps every decision, and nothing is reported done before the full checks have run.

**Consequences:** Claude Code can't stop someone from using the other agents directly, so the orchestrator is the entry point by convention and by the setting. Running `claude --agent <name>` picks another agent for one session. The agents' files change with the process they describe, in the same PR.
