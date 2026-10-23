# 0045. The browser-test fixtures move to a second page, `fixtures.html`

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
[ADR 0006](0006-bare-demo-as-e2e-target.md) made the bare `demo/` page the target of the Playwright specs, and said that PRs 9 to 11 turn the same package into the preview site while the specs keep targeting it.

The specs depend on fixtures that a visitor-facing site wouldn't show: Cancel all, the status output, the seeded confetti and the renderer select, the clipping fixture, the unmount toggle and the pointer pad. PRs 9, 10 and 11 each change the site's layout.

Options considered:
- A second page in the same package, holding the bare page as it is.
- A "Test fixtures" section on the site, below the preview, restyled with the site's tokens. Visitors would see it.
- Pointing the specs at the site's own controls where they exist, with hidden test-only elements for the rest.

## Decision
- The demo package builds two pages from two Rsbuild entries. `index.html` (entry `index`) is the preview site. `fixtures.html` (entry `fixtures`) is the bare page from PRs 5 to 8.
- The bare page moves to `demo/src/fixtures/{main.tsx,app.tsx,style.css}` with its content, `data-testid`s and plain styles unchanged. It doesn't use the site's tokens, fonts or components, so a site change can't move a fixture.
- `e2e/smoke.ts` and `e2e/renderer.ts` open `/fixtures.html`. They still find elements by `data-testid`.
- A new `e2e/site.ts` covers the site itself: the "Reward me" button draws, the hash picks the effect (`demo/README.md`, "Routing"), and a stored theme is applied before the app's script runs.
- The site doesn't link to the fixture page.

## Consequences
- The site can change in PRs 9 to 11 without breaking the renderer and hook specs.
- There are two pages to maintain, still in one package with one build. ADR 0006's "one demo package" holds for the package, not the page.
- The fixture page is part of the build, so PR 11's GitHub Pages deploy publishes it, unlinked, unless that PR leaves it out.
- The site's own renderer toggle and clipping card (PR 11) are for visitors. The specs keep using the fixture page's copies, unless PR 11 decides otherwise.
