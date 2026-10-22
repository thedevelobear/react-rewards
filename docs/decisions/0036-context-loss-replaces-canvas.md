# 0036. A lost WebGL context ends running bursts and replaces the canvas

- **Status:** Proposed
- **Date:** 2026-10-22

## Context
A WebGL context can be lost at any time: after a GPU reset or driver update, or when the browser reclaims contexts. The plan says that on loss, active bursts end cleanly and call `onComplete`, and that the next burst rebuilds the WebGL renderer, or falls back to Canvas 2D if WebGL2 can't be created again. It doesn't say what `finished` resolves with, or whether the renderer waits for the browser to restore the same context.

A lost context only comes back if the page calls `preventDefault()` on `webglcontextlost`, and then only when the browser fires `webglcontextrestored`, which may never happen.

## Decision
- On `webglcontextlost`, every running burst ends as `'complete'` and `onComplete` is called. That is how an effect that throws in `update` ends ([ADR 0030](0030-effect-errors-swallowed.md)): its simulation had started, so it isn't `'skipped'` ([ADR 0025](0025-cancel-skips-on-complete.md)).
- The overlay then removes the canvas and its renderer at once, even if no burst was running. The renderer doesn't call `preventDefault()` and doesn't wait for `webglcontextrestored`.
- The next burst mounts a fresh canvas and picks a renderer as `setRenderer` says ([ADR 0033](0033-strict-public-set-renderer.md)). Under `'auto'` that is WebGL2 first and Canvas 2D if WebGL2 can't be created. Under `'webgl'`, the burst is skipped if WebGL2 can't be created.

## Consequences
- There is one recovery path (a new canvas), which is the same as the first mount, so there's no restore code to test separately.
- A burst running during a loss stops early and does not move to the new renderer. Losses are rare, and rewards are decorative.
- The browser test loses the context with `WEBGL_lose_context`, checks that the burst ends as `'complete'`, and checks that the next burst draws.
