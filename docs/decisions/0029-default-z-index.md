# 0029. The overlay's `zIndex` defaults to 2147483647

- **Status:** Accepted
- **Date:** 2026-10-22

A burst's `zIndex` defaults to 2147483647, the largest value browsers accept. The overlay takes the highest `zIndex` among its running bursts.

**Why:** v3 draws on one fixed canvas on `document.body`. At v2's default of 0, it would sit under modals, sticky headers and anything else with a positive z-index.

**Consequences:** The canvas has `pointer-events: none`, so it never blocks clicks. A page that wants particles under something passes a lower `zIndex`.
