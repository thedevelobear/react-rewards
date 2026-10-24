# 0036. A lost WebGL context ends running bursts and replaces the canvas

- **Status:** Accepted
- **Date:** 2026-10-22

On `webglcontextlost`, running bursts end as `'complete'` and bursts still waiting for sprites end as `'skipped'`, all calling `onComplete`. The overlay removes the canvas and its renderer at once, without waiting for `webglcontextrestored`. The next burst mounts a fresh canvas and picks a renderer as `setRenderer` says ([ADR 0033](0033-strict-public-set-renderer.md)).

**Why:** A context only comes back if the page asks for it, and the browser may never restore it. A fresh canvas is the same path as the first mount, so there's no restore code to test separately.

**Consequences:** A burst running during a loss stops early. Losses are rare, and rewards are decorative.
