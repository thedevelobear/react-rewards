# 0052. Any effect is an `Effect`, and `fire` and `useReward` are generic over the effect

- **Status:** Accepted
- **Date:** 2026-10-24

- `EffectDefinition<C>` declares `sprites`, `spawn` and `update` as method signatures, so every `Effect<C>` is an `Effect`.
- `ConfigOf<E>` (exported) is an effect's config type, and distributes over a union.
- `fire` is `<E extends Effect>(effect: E, options: FireOptions<ConfigOf<E>>)`, and `useReward` is `<E extends Effect>(target, effect: E, config?: Partial<ConfigOf<E>>, options?)`.

**Why:** Function properties made `Effect<C>` contravariant in `C`, so neither `Effect[]` nor `useReward(ref, party ? confetti : emoji)` type-checked. Method signatures fix the list. Inferring the config from the effect fixes the union, which TypeScript otherwise infers from its first member.

**Consequences:** For a union, `config` accepts any member's keys. The type parameter is the effect, so `useReward<typeof confetti>(...)`. Bivariance lets an effect's methods be called by hand with an incomplete config, but `fire` and `useReward` never do.
