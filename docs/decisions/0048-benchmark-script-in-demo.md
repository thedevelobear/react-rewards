# 0048. The benchmark harness is a script in `demo/`

- **Status:** Accepted
- **Date:** 2026-10-23

`pnpm bench` builds the library and the demo, then runs `demo/bench/run.ts`. It serves the built site and drives the Stress test page in a headed Chromium with Playwright, with every effect at 500, 5000 and 20000 particles on each renderer. It uses the v2 baseline's method: a 1280×860 window, a fresh tab per run, one warm-up and three recorded bursts, and the median. It prints the table for `docs/benchmarks/`. It doesn't run in CI.

**Why:** A re-run after an engine change is one command, and the numbers compare with v2's. It needs a visible window, and its numbers depend on the machine.

**Consequences:** The harness depends on the Stress test page's `data-testid`s.
