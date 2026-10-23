# 0006. A bare `demo/` page is the browser-test target from PR 5

- **Status:** Accepted. The page the specs open is refined by [0045](0045-fixture-page.md).
- **Date:** 2026-10-22

## Context
The original plan ran the Playwright tests "against the built demo" and added them in step 2 (tests and CI). The demo itself was only built in step 3, after the engine. So the browser tests had nothing to run against when the renderers were written, and the WebGL renderer would have merged without its parity and fallback checks.

## Decision
- PR 5 (`fire()` and confetti) creates `demo/` as a pnpm workspace member with a minimal page: a button per effect, a renderer toggle, and the fixtures the specs need, such as an `overflow: hidden` and `transform` wrapper.
- Playwright and the smoke spec are added in PR 5, not PR 2. PR 6 adds the parity and fallback specs.
- PRs 9 to 11 turn the same package into the designed preview site. The specs keep targeting it.

## Consequences
- Every renderer PR is tested in a real browser.
- The site redesign can break the specs. To limit that, specs select elements by `data-testid`, not by visual structure.
- There is one demo package, not a separate test fixture to maintain.
