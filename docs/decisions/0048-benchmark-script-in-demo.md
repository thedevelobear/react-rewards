# 0048. The benchmark harness is a script in `demo/`

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
PR 1 measured v2.1.0 with a harness that ran from a scratch directory outside the repo. Its full source is in [the v2 baseline](../benchmarks/2026-10-22-v2-baseline.md), so the run can be repeated. PR 11 measures the new engine at 500, 5000 and 20000 particles, once per renderer, with the same method (plan, step 1c).

Options considered (plan, open question 3):
- A script in the repo, run with one command.
- Recreate the harness outside the repo for each run, and paste its source into the benchmark document, as for v2.

## Decision
- The harness is `demo/bench/run.ts`, run with `pnpm bench` at the root, which builds the library and the demo first, as `pnpm e2e` does. Node 26 runs the TypeScript file directly, by stripping its types.
- It serves the built site with Rsbuild's preview server and drives the site's Stress test page through its controls ([demo README, Stress test](../../demo/README.md#stress-test)), with Playwright's Chromium. Playwright is already one of the demo's dev dependencies.
- It keeps v2's method, so the numbers compare: a headed window at 1280×860, a fresh tab for each effect, count and renderer, a 1.5 s settle and a check that `requestAnimationFrame` isn't throttled, one warm-up burst, then 3 recorded bursts, with the median reported. A burst runs from the click until it ends. Frame timing comes from the harness's own `requestAnimationFrame` timestamps, and main-thread time from the Chrome DevTools Protocol's `Performance.getMetrics`.
- It runs every effect at 500, 5000 and 20000 particles, under `'webgl'` and `'canvas'`. It prints the table and the raw runs in the format of `docs/benchmarks/`, and writes the full results to `demo/bench/results.json`, which git ignores.
- It doesn't run in CI. It needs a visible window, and its numbers depend on the machine.
- The v2 harness stays in the v2 baseline. It isn't brought into the repo, because it installs `react-rewards@2.1.0` from npm, which has the workspace package's name.

## Consequences
- Re-running the benchmark after an engine change is one command, on the machine that recorded the earlier numbers.
- The harness depends on the Stress test page's controls and its `data-testid`s. A change to the page has to keep them, or update the harness.
- The script is linted and type-checked with the rest of `demo/`.
