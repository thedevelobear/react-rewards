# 0045. The browser-test fixtures move to a second page, `fixtures.html`

- **Status:** Accepted
- **Date:** 2026-10-23

The demo builds two pages: `index.html` is the preview site, and `fixtures.html` is the bare test page that came before the site, unchanged, in `demo/src/fixtures/`. It uses none of the site's tokens or components. The renderer and hook specs open `/fixtures.html`, and `e2e/site.ts` covers the site itself. The site doesn't link to the fixture page.

**Why:** The specs need controls a visitor shouldn't see, such as Cancel all, the seeded trigger and the clipping fixture, and the site's layout changes in every site PR.

**Consequences:** The site can change without breaking the specs. Two pages are maintained in one package, and the fixture page is deployed, unlinked.
