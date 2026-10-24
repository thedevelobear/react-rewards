# 0034. WebGL merges only neighbouring batches with the same blend mode

- **Status:** Accepted
- **Date:** 2026-10-22

The WebGL2 renderer draws the frame's batches in order, with one instanced draw call for each run of consecutive batches with the same blend mode. Later batches are on top in both renderers.

**Why:** Grouping every batch by blend mode would draw all additive bursts after all normal ones, whatever order they started in, and WebGL would no longer match Canvas 2D.

**Consequences:** Alternating blend modes cost one draw call per run. Every built-in effect uses `normal`, so a frame is one draw call.
