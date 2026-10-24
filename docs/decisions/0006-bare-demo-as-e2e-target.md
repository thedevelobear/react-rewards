# 0006. A bare `demo/` page is the browser-test target from PR 5

- **Status:** Accepted. The page the specs open is refined by [0045](0045-fixture-page.md).
- **Date:** 2026-10-22

`demo/` is a pnpm workspace member from PR 5, with a bare page: a button per effect, a renderer toggle and the fixtures the Playwright specs need. The smoke spec arrives in PR 5, and the parity and fallback specs in PR 6. PRs 9 to 11 turn the same package into the preview site. Specs select elements by `data-testid`.

**Why:** The original plan built the demo after the engine, so the WebGL renderer would have merged with no browser to test it in.
