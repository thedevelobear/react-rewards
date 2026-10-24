# 0055. Built-in effects are marked pure, so unused ones tree-shake

- **Status:** Accepted
- **Date:** 2026-10-24

Each built-in effect's `defineEffect` call is marked `/* @__PURE__ */`, and the effect guide asks new effects to do the same. `.size-limit.json` reports `useReward` with each effect, beside the whole package, still with no budget ([ADR 0013](0013-size-limit-report-only.md)).

**Why:** `dist/index.js` is one file, and a bundler can't tell that a top-level `defineEffect()` call is pure, so every effect, the balloon's SVG included, was bundled. With the annotation, `useReward` with `confetti` drops from 9.32 kB to 7 kB. Rslib keeps `@__PURE__` but drops `#__NO_SIDE_EFFECTS__`.

**Consequences:** Nothing fails if the comment is lost. The per-effect sizes in the report converging on the whole package's is the only sign.
