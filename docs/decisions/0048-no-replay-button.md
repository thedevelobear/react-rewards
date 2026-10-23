# 0048. The preview has no replay button

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
Step 3 of the plan puts a centred "Reward me" button and a replay button in the preview container, without saying what replay does. "Reward me" already fires the effect again on every click.

Options considered:
- Replay the last burst: each "Reward me" click picks a random seed, and replay fires again with the last one, so the same burst plays again.
- Fire again from the "Reward me" button, which repeats what that button does.
- No replay button.

## Decision
- The preview container holds the "Reward me" button, and from PR 11 the fps and renderer readout. There is no replay button.

## Consequences
- The site doesn't show seeded replays. The fixture page's seeded confetti still exercises `seed` ([ADR 0045](0045-fixture-page.md)).
