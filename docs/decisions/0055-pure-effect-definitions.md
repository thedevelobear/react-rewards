# 0055. Built-in effects are marked pure, so unused ones tree-shake

- **Status:** Proposed
- **Date:** 2026-10-24

## Context
The package is one bundled file, `dist/index.js`, and is marked `sideEffects: false`. That flag lets a bundler drop whole modules, but inside one file it drops a top-level binding only when its initialiser has no side effects. Each built-in effect is `const confetti = defineEffect({...})`, and a bundler can't tell that the call is pure, so it keeps every effect.

PR 12 measured it with size-limit, which bundles with Rolldown. Importing `useReward` and `confetti` gave 9.32 kB minified and gzipped, the same as with `emoji` or `balloon` and close to the whole package's 9.58 kB. The balloon's SVG was in every bundle. PR 7's note that an app without `balloon` doesn't pay for it was wrong.

Options considered:
- `/* @__PURE__ */` before each built-in effect's `defineEffect` call. Rollup, Rolldown, esbuild, webpack's Terser and SWC all read it, and Rslib keeps it in `dist/index.js`, although the build drops every other comment.
- `/* #__NO_SIDE_EFFECTS__ */` on `defineEffect`'s declaration, which would also cover custom effects. Rslib drops this one from the build, and fewer bundlers read it.
- No change, and the README drops the tree-shaking claim.

## Decision
- Each built-in effect's `defineEffect` call is marked `/* @__PURE__ */`. The effect guide asks every new effect to do the same.
- `.size-limit.json` gains a report-only entry per effect, `useReward` plus that effect, beside the whole package. There is still no budget ([ADR 0013](0013-size-limit-report-only.md)).

## Consequences
- With the annotations, `useReward` plus `confetti` is 7 kB, plus `emoji` 6.94 kB, and plus `balloon` 8.93 kB, most of the difference being the SVG. The whole package stays 9.58 kB.
- CI's size report shows each effect's cost, so an effect that stops tree-shaking shows up as the per-effect sizes converging on the whole package's.
- The annotation is a comment, so a formatter or a refactor can drop it without any test failing. Only the size report catches that.
