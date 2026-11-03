# 0079. The build targets the supported browsers: Chrome and Edge 87, Firefox 79, Safari 14.1

- **Status:** Proposed
- **Date:** 2026-11-03

- `browsers.browserslistrc` holds the supported browsers as a browserslist query: `chrome >= 87`, `edge >= 87`, `firefox >= 79`, `safari >= 14.1` and `ios_saf >= 14.5`. It isn't named `.browserslistrc`, because `demo/`'s build looks for one in its parent folders and would take it as its own.
- `rslib.config.ts` reads that file into `syntax`, in place of `es2022`. SWC lowers any syntax one of them lacks, with `env.bugfixes`, so it rewrites only the forms those browsers get wrong rather than whole features. Today that moves `ParticleView`'s two class fields into its constructor.
- The floor is what `dist/index.js` needs. Its highest needs are `inset` in the overlay's style, for Chrome and Edge 87 and Safari 14.1, and logical assignment (`??=`), for Firefox 79. That comes from MDN's browser-compat-data (8.1.8) for each newer syntax feature, built-in, DOM and CSS feature the build uses, and from `es-check checkBrowser` (9.8.1) against the query.
- WebGL2 (Safari 15) and the `composite` option of `Element.animate` (Chrome 84, Firefox 80, Safari 16) aren't part of the floor. Without WebGL2 a burst draws with Canvas 2D ([ADR 0001](0001-v3-direction.md)), and without `composite` an element animation replaces the element's transform while it plays ([ADR 0073](0073-effects-animate-their-element.md)).
- The build lowers syntax, and adds no polyfills. `pnpm compat:check` runs `es-check checkBrowser --checkFeatures` (9.8.1, a dev dependency) on `dist/**/*.js` against the same file, after the build and in CI. It fails on syntax or an ES built-in, such as `Array.prototype.at`, that a supported browser lacks. It doesn't check DOM or CSS features, such as `inset`, which stay for review against MDN's data, as above.

**Why:** With `es2022`, the floor was whatever the code happened to use, and new syntax could raise it without anyone noticing. The supported browsers are now stated ([ADR 0075](0075-versioning-policy.md)), so the build holds them.

**Consequences:** The class-field helper adds about 0.07 kB gzipped. Raising the floor, to use a newer API or to ship newer syntax as written, drops a supported browser, which is a major release.
