# 0001. v3 direction: toolchain, engine and API

- **Status:** Accepted
- **Date:** 2026-10-22

| Area | Decision |
|---|---|
| Package manager | pnpm, with `demo/` as a workspace member. |
| Lint and format | Biome 2, replacing ESLint, Prettier and Babel. |
| Library build | Rslib, with tsdown as the fallback. |
| Demo build | Rsbuild. |
| TypeScript | 7.x, for type-checking only. |
| Rendering | WebGL2 instanced sprites with a Canvas 2D fallback, behind one renderer interface. The simulation runs in TypeScript on the CPU. Colour is baked into sprites, with no per-particle tint. |
| Tests | Rstest in Node. Playwright in Chromium for WebGL, which jsdom can't run. |
| CI | GitHub Actions. |
| API | No backward compatibility: `useReward(ref, effect, config)`, with effects imported by name. |
| React | Peer dependency `react >=18`, as version 3.0.0. |
| Reduced motion | Bursts are skipped by default. `respectReducedMotion` opts out. |
| Preview site | In this repo, on GitHub Pages, with a system, light and dark theme switcher. |

**Why:** v2's tooling (Rollup 2, ESLint 8, TypeScript 4.6, Yarn) was dated, and its DOM animations were hard to extend with new effects. The [original plan](../plans/2026-10-21-toolchain-upgrade-and-preview-site.md) gives the reasons and rejected options for each row.
