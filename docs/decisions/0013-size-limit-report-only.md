# 0013. size-limit reports the bundle size, with no budget

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
The plan put size-limit in CI in PR 2 with a budget based on v2.1.0's size (3.72 kB minified and gzipped), and had PR 8 set the final budget from the measured size of the new engine. The engine, its two renderers and three effects are more code than v2's DOM animations, so PRs 5 and 6 would very likely go over 3.72 kB before PR 8.

The maintainer's answer: the small size was a selling point, but it was small because there was not much code. They will optimise once it gets too large.

## Decision
- size-limit runs in CI and locally (`pnpm size`) with no `limit`. It prints the size and never fails on it.
- It measures `dist/index.js` bundled and minified with Rolldown (`@size-limit/preset-small-lib` 14), with React excluded as a peer dependency. It compresses with gzip (`gzip: true`), not size-limit's default brotli, so the numbers compare directly with the 3.72 kB recorded for v2.1.0.
- PR 8 does not set a budget. A budget is added only when the maintainer asks for one.

## Consequences
- Size growth is visible on every CI run, but nothing gates it. Reviewers compare the number by hand.
- The README's "3.6kB gzipped" claim stops being true once the engine lands. PR 12 replaces it with the measured number or removes it.
- Adding a budget later is one line in `.size-limit.json`, plus a new ADR.
