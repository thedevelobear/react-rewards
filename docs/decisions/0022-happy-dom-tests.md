# 0022. Tests that need a DOM run in happy-dom

- **Status:** Accepted
- **Date:** 2026-10-22

`rstest.config.ts` has two projects that extend the Rslib config. `node` runs `src/**/test.{ts,tsx}`, and `dom` runs `src/**/dom-test.{ts,tsx}` in happy-dom 20.14.6. Canvas contexts and `ResizeObserver` are still faked, and real rendering is tested in the browser.

**Why:** The overlay canvas lives on `document.body`, so it needs a DOM in tests. With happy-dom it uses `document` and `window` directly, with no injection just for tests. Rstest 0.12 accepts happy-dom 20 only.

**Consequences:** Upgrading happy-dom to 21 waits for a Rstest release that accepts it.
