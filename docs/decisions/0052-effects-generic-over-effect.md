# 0052. Any effect is an `Effect`, and `fire` and `useReward` are generic over the effect

- **Status:** Accepted
- **Date:** 2026-10-24

## Context
`EffectDefinition<C>` declared `sprites`, `spawn` and `update` as readonly function properties that take the config `C`. Under `strictFunctionTypes`, that made `Effect<C>` contravariant in `C`, so an `Effect<ConfettiConfig>` wasn't an `Effect<EffectConfig>`. A list of effects, such as `const effects: Effect[] = [confetti, emoji]`, didn't type-check. The demo worked around it with an existential helper, `effectPage()` (plan, open question 8).

Declaring the three functions as method signatures makes TypeScript compare their parameters bivariantly, so any `Effect<C>` is an `Effect`. That fixes the list, but not a union passed inline, such as `useReward(ref, party ? confetti : emoji)`. `fire` and `useReward` were generic over the config, `<C>(effect: Effect<C>, config?: Partial<C>)`. TypeScript infers `C` from the first member of the union, `ConfettiConfig`, and then rejects `Effect<EmojiConfig>`. Both shapes were checked with `tsc` against the built-in effects.

Options considered:
- Method signatures only. A union then needs an annotation: `const e: Effect = party ? confetti : emoji`, or `useReward<EffectConfig>(...)`.
- Method signatures, plus `fire` and `useReward` generic over the effect, with the config type read from it.

## Decision
- `EffectDefinition<C>` declares `sprites`, `spawn` and `update` as method signatures. `Effect<C>` is assignable to `Effect` (that is, `Effect<EffectConfig>`) for every config `C`.
- A new type, `ConfigOf<E>`, is the config type of the effect `E`: `E extends Effect<infer C extends EffectConfig> ? C : never`. It distributes over a union, so the config of `confetti | emoji` is `ConfettiConfig | EmojiConfig`.
- `fire` is `<E extends Effect>(effect: E, options: FireOptions<ConfigOf<E>>) => Burst`.
- `useReward` is `<E extends Effect>(target, effect: E, config?: Partial<ConfigOf<E>>, options?) => UseRewardResult`.
- `src/index.ts` exports `ConfigOf`. This adds to the export list in [ADR 0028](0028-public-exports-from-pr-5.md).

## Consequences
- `useReward(ref, party ? confetti : emoji)`, the same with `{ count: 10 }`, and `fire(either, { origin, config })` all type-check, and so does a list typed `Effect[]`.
- For a single effect, a key it doesn't have, or a value of the wrong type, is still an error.
- For a union, `config` may set any member's keys. A key the chosen effect doesn't have is copied into its config and never read.
- When one effect's config has every field of another's, TypeScript reduces `a ? b : c` to the effect with fewer fields, and the extra keys become errors. The built-in effects' configs each have a field the others lack, so any two of them work. An effect whose config is only `count` and `lifetime` always has fewer fields, so the tests pair effects that each have a field of their own.
- Bivariance lets an `Effect` be called by hand with a config missing its own fields: `effect.spawn(p, { count: 1, lifetime: 1000 }, rng, 0)` type-checks. The engine calls these functions only with a config resolved from the effect's defaults, so the hole isn't reachable through `fire` or `useReward`.
- The public type parameter of `fire` and `useReward` is now the effect, not its config. A caller that wrote `useReward<ConfettiConfig>(...)` writes `useReward<typeof confetti>(...)`. Nothing is released yet, so no published caller breaks.
- The demo no longer needs `effectPage()` for assignability. It keeps the helper, so the shared components still see each page's own config type ([demo README](../../demo/README.md)).
