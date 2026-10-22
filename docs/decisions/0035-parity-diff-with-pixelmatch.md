# 0035. The parity spec compares screenshots with pixelmatch

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
PR 6 adds a browser spec that renders one deterministic frame with `setRenderer('webgl')` and again with `setRenderer('canvas')`, and compares the two images within a tolerance. Playwright compares a screenshot only with a stored baseline, not with another screenshot. Options considered: decode both screenshots in Node and diff them with pixelmatch; send both back into the page and compare them with `getImageData`, which needs no dependency; or commit baselines, which differ between macOS and the Linux CI.

## Decision
- `demo/` adds `pixelmatch` 8.0.0, `pngjs` 7.0.0 and `@types/pngjs` 6.0.5 as dev dependencies, at exact versions ([ADR 0015](0015-exact-dependency-versions.md)).
- The frame is made deterministic with a seeded burst from a fixed point, while Playwright's fake clock (`page.clock`) drives `requestAnimationFrame`. Both renderers draw the same simulated moment.
- The spec takes the same screenshot area for each renderer, decodes both with pngjs, and counts the differing pixels with pixelmatch. The tolerance (pixelmatch's per-pixel threshold and the share of pixels allowed to differ) is set from measurement in PR 6 and noted in the plan.

## Consequences
- No baseline images to keep up to date across platforms.
- `demo/` gets a seeded, fixed-point trigger and a renderer toggle, selected by `data-testid` ([ADR 0006](0006-bare-demo-as-e2e-target.md)).
- A renderer that draws nothing would fail the same spec, because the spec also checks that each frame differs from a blank one.
