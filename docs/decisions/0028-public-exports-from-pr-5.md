# 0028. The public exports after PR 5

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
PR 5 deletes the v2 code, and with it the v2 exports (`useReward`, `confetti`, `balloons`, `emoji`). The plan says custom effects made with `defineEffect` work exactly like the built-in ones. The built-in effects also use the helpers in `core/math` (`damp`, `accelerate`, the easings, `degToRad`). Options considered: export `fire`, `confetti` and `defineEffect`; also export the math helpers; or export only `fire` and `confetti` until the effect guide in PR 12.

## Decision
- `src/index.ts` exports `fire`, `confetti` and `defineEffect`.
- It also exports the types that appear in their signatures: `BlendMode`, `Burst`, `BurstEnd`, `ConfettiConfig`, `Effect`, `EffectConfig`, `EffectDefinition`, `FireOptions`, `Origin`, `Particle`, `Rng`, `SpriteSource` and `UpdateContext`.
- The math helpers stay internal. PR 12's effect guide decides how custom effects get them.
- Emoji and balloons are exported again in PR 7, and `useReward` in PR 8.

## Consequences
- Between PR 5 and PR 8 the integration branch has no hook. Nothing is released from it until PR 12.
- A custom effect can be written now, but it re-implements drag and gravity itself until the helpers are public.
