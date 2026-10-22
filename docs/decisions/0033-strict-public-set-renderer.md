# 0033. `setRenderer` is public, and a forced renderer never falls back

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
The plan adds `setRenderer('auto' | 'webgl' | 'canvas')` in PR 6, for the browser tests and for a renderer toggle in `demo/`. The demo imports the built package ([ADR 0031](0031-demo-imports-built-package.md)), so the toggle can only call what the package exports. [ADR 0028](0028-public-exports-from-pr-5.md) lists the exports after PR 5 and doesn't include it.

The plan doesn't say what a forced renderer does when the browser can't provide it, for example `setRenderer('webgl')` without WebGL2. Options considered: skip the burst, or fall back to Canvas 2D as `'auto'` does. If a forced `'webgl'` fell back, the parity spec could compare Canvas 2D with itself and pass without noticing.

The plan also doesn't say when a new choice takes effect while the overlay is mounted.

## Decision
- `src/index.ts` also exports `setRenderer` and its argument type, `RendererPreference` (`'auto' | 'webgl' | 'canvas'`). The default is `'auto'`. The choice applies to the whole page.
- `'auto'` tries WebGL2 first, then Canvas 2D, each on a fresh canvas.
- `'webgl'` and `'canvas'` create only that renderer. If it isn't available, bursts are skipped: `finished` resolves with `'skipped'` and `onComplete` is called ([ADR 0025](0025-cancel-skips-on-complete.md)).
- A new choice applies from the next burst. If no burst holds the overlay, the overlay and its renderer are removed at once. If bursts are running, they finish on the current renderer, and the overlay is removed when the last one ends instead of being hidden. Setting the current choice again does nothing.

## Consequences
- The parity spec can trust that a forced renderer is the one that drew.
- A page that forces `'webgl'` shows nothing on browsers without WebGL2. The README (PR 12) says to use `'auto'` in production.
- This adds to the export list in [ADR 0028](0028-public-exports-from-pr-5.md).
