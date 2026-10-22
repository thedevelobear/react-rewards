# 0022. Tests that need a DOM run in happy-dom, from PR 4

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
[ADR 0016](0016-keep-rstest.md) planned a Rstest `projects` setup for PR 8, so that the hook's tests could run with a DOM. PR 4 needs one earlier. The overlay canvas is created on `document.body`, styled, observed with `ResizeObserver`, hidden when idle and removed after a timeout. The plan only named a mock 2D context for the Canvas 2D renderer, which covers the drawing but not the overlay.

Options considered:
- happy-dom through Rstest `projects`, from PR 4.
- Hand-written fakes, with the overlay taking `document`, `ResizeObserver` and `matchMedia` as parameters.

Rstest 0.12 declares `happy-dom ^20.8.3` as a peer dependency. The latest happy-dom on 2026-10-22 is 21.0.4, outside that range. The latest 20.x is 20.14.6.

## Decision
- happy-dom 20.14.6 is a devDependency.
- `rstest.config.ts` has two projects that both extend the Rslib config. `node` runs `src/**/test.{ts,tsx}`. `dom` runs `src/**/dom-test.{ts,tsx}` in happy-dom.
- A test file that needs a DOM is named `dom-test.ts` (or `dom-test.tsx`). Everything else stays `test.ts` and runs in plain Node. A folder may have both.
- Canvas contexts and `ResizeObserver` are still faked in tests. happy-dom does not draw, and the real rendering is checked in the browser (PR 5 onwards).

## Consequences
- The overlay uses `document` and `window` directly, with no injection plumbing just for tests.
- PR 8 reuses the `dom` project for the hook, as ADR 0016 planned, only earlier.
- Upgrading happy-dom to 21 waits for a Rstest release that accepts it.
- Step 1b's naming rules gain one role name, `dom-test`.
