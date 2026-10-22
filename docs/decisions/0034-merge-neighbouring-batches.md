# 0034. WebGL merges only neighbouring batches with the same blend mode

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
The plan says the WebGL2 renderer "merges batches with the same blend mode into one draw call", and step 1c says it draws every particle "in one draw call per blend mode". The frame contract from PR 4 says batches are drawn in order, so later bursts are on top, and the Canvas 2D renderer does that. Grouping every batch by blend mode would draw all additive bursts after all normal ones, whatever order they started in, and the two renderers would no longer match.

## Decision
- The WebGL2 renderer walks the frame's batches in order. Each run of consecutive batches with the same blend mode is drawn with one instanced draw call.
- Both renderers keep the frame's order: later batches are on top.

## Consequences
- The renderers match for any mix of blend modes, so the parity spec stays meaningful once an additive effect exists.
- A frame whose bursts alternate between normal and additive costs one draw call per run, not one per blend mode. Every built-in effect so far uses `normal`, so today a frame is one draw call.
