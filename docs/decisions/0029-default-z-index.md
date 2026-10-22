# 0029. The overlay's `zIndex` defaults to 2147483647

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
v2 put its particles inside the trigger element with `zIndex` 0 by default. v3 draws on one fixed canvas on `document.body` ([ADR 0023](0023-fire-options-beside-config.md) puts `zIndex` in the burst options). At 0, the canvas sits under anything with a positive z-index, so a burst fired from inside a modal, or one that flies under a sticky header, is hidden.

## Decision
- A burst's `zIndex` defaults to 2147483647, the largest 32-bit integer that browsers accept.
- The overlay takes the highest `zIndex` among the running bursts (PR 4).

## Consequences
- Bursts show above modals, headers and other overlays by default. The canvas has `pointer-events: none`, so it never blocks clicks.
- A page that wants particles under something passes a lower `zIndex`.
