# 0001. v3 direction: toolchain, engine and API

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
The plan [2026-10-21-toolchain-upgrade-and-preview-site.md](../plans/2026-10-21-toolchain-upgrade-and-preview-site.md) proposed a toolchain, a new animation engine and a preview site for v3. It ended with ten points it had defaulted on. The maintainer answered each one. This ADR records what was accepted. The plan holds the full rationale and the rejected options.

## Decision
| Area | Decision |
|---|---|
| Package manager | pnpm, with `demo/` as a workspace member in the same repo. |
| Lint and format | Biome 2 replaces ESLint, Prettier, Babel and their plugins. |
| Library build | Rslib. tsdown is the fallback if Rslib's declaration output misbehaves. |
| Demo build | Rsbuild. |
| TypeScript | 7.x, for type-checking only. |
| Rendering | A WebGL2 instanced sprite renderer with a Canvas 2D fallback, both behind one renderer interface. Simulation runs in TypeScript on the CPU. Per-particle `tint` is removed so both renderers look the same: colour is baked into sprites. The fallback has no particle cap unless benchmarks show it needs one. |
| Tests | Rstest in Node. Playwright in Chromium for the WebGL renderer and the renderer parity check, since WebGL cannot run in jsdom. |
| CI | GitHub Actions. |
| API | No backward compatibility. `useReward(ref, effect, config)`, effects imported by name, one unified config, string ids dropped. |
| React support | Peer dependency `react >=18`. The version becomes 3.0.0. |
| Reduced motion | `prefers-reduced-motion: reduce` skips the effect by default. A `respectReducedMotion` option opts out. |
| Preview site | Lives in this repo and deploys to GitHub Pages. Dark mode with a system, light and dark switcher. reactbits.dev styling with the blog's colours. |

Two of the original answers changed the plan's text and have their own ADRs: CJS output is dropped ([0004](0004-esm-only-output.md)), and balloon click-to-pop is dropped ([0005](0005-effect-contract-scope.md)).

## Consequences
- Changing any row above needs a new ADR that supersedes this one for that row.
- The active plan, [2026-10-22-v3-rewrite.md](../plans/2026-10-22-v3-rewrite.md), is written against these decisions.
