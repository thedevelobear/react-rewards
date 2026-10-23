# 0046. The site picks the effect from the URL hash

- **Status:** Accepted. The page for an empty or unknown hash is refined by [0055](0055-getting-started-home-page.md)
- **Date:** 2026-10-23

## Context
The site's sidebar lists the effects, and the page shows one at a time. PR 11 deploys the site to GitHub Pages, under `/react-rewards/`. GitHub Pages serves static files only, so a path like `/react-rewards/emoji` returns 404 unless a `404.html` redirects it.

Options considered:
- The URL hash (`#emoji`), read without a router library.
- Path routes (`/emoji`) through a router library or the History API. They need a `404.html` fallback on GitHub Pages, and the base path set in Rsbuild.
- React state only. No deep links, and a reload returns to the first effect.

## Decision
- The URL hash names the effect: `#confetti`, `#emoji`, `#balloon`. The hash is the effect's `name` (so `#balloon`, [ADR 0037](0037-balloon-effect-name.md)), not its display label.
- An empty or unknown hash shows the first effect in the sidebar, Confetti. The URL is left as it is.
- Sidebar items are plain links (`<a href="#emoji">`). The current one has `aria-current="page"`.
- A `use-hash` hook in `demo/src/hooks/` reads the hash with `useSyncExternalStore` and the `hashchange` event. There is no router dependency.
- The document title follows the effect, for example "Confetti · react-rewards".

## Consequences
- Deep links, reloads, and the back and forward buttons work. The site works under any base path, with no `404.html`.
- The hash is taken, so in-page anchors (such as a link to PR 10's props table) can't use it for themselves.
- A new effect needs no routing code. Its demo entry in `demo/src/data/effects/` gives it a sidebar link and a hash.
