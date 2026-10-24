# 0006. A bare `demo/` page is the browser-test target

- **Status:** Accepted. The page the specs open is refined by [0045](0045-fixture-page.md).
- **Date:** 2026-10-22

`demo/` is a pnpm workspace member from the moment `fire()` exists, with a bare page: a button per effect, a renderer toggle and the fixtures the Playwright specs need. The smoke spec arrives with it, and the parity and fallback specs with the WebGL renderer. The preview site is built in the same package. Specs select elements by `data-testid`.

**Why:** The original plan built the demo after the engine, so the WebGL renderer would have merged with no browser to test it in.
