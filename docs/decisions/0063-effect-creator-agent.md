# 0063. An effect-creator agent for Claude Code lives in the repo

- **Status:** Proposed
- **Date:** 2026-10-24

- `.claude/agents/effect-creator.md` defines a Claude Code subagent for writing effects and extending the engine. It holds the engine's model as the maths sees it (units, the step, drawing, sprites, randomness), the closed forms for flight with drag, the techniques the built-in effects use to stay frame-rate independent, how to design and test an effect, and where an engine change has to land.
- It follows `AGENTS.md` and `docs/guides/adding-an-effect.md` rather than repeating their process, and leaves the name, look, defaults and public API of an effect to the maintainer.

**Why:** Effects are mostly maths, and the mistakes that matter, such as drift between frame rates or an oscillation that fights the drag, don't show in a type check. Writing the model down once lets anyone with Claude Code add an effect the way the built-in ones are built.

**Consequences:** A change to the effect contract, the stepping, the math helpers or the renderers updates the agent in the same PR.
