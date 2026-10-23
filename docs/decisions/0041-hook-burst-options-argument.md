# 0041. The hook takes the burst options as a fourth argument

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
[ADR 0001](0001-v3-direction.md) set the hook's signature as `useReward(ref, effect, config)`. [ADR 0023](0023-fire-options-beside-config.md) then put the burst options (`zIndex`, `onComplete`, `respectReducedMotion`, `seed`) beside the effect's config in `fire()`, and left the hook's argument shape to PR 8.

Options considered:
- The burst options as an optional fourth argument: `useReward(ref, confetti, { count: 120 }, { zIndex: 10 })`.
- The same options object as `fire()`, with `config` nested: `useReward(ref, confetti, { config: { count: 120 }, zIndex: 10 })`. This would change ADR 0001's signature.
- One flat object that the hook splits. Effects could then not use the burst option names as config keys, which is why ADR 0023 rejected this shape for `fire()`.

## Decision
- The signature is `useReward(target, effect, config?, options?)`.
- `target` is an element or a ref to one. `config` is a `Partial` of the effect's config, applied over its defaults as in `fire()`.
- `options` takes `zIndex`, `onComplete`, `respectReducedMotion` and `seed`, with the same meaning and defaults as in `fire()`. Its type is `fire()`'s options without `origin` and `config`, so a burst option added to `fire()` reaches the hook too.
- `src/index.ts` exports `useReward` and the types in its signature: `RewardTarget`, `RewardOptions` and `UseRewardResult`.

## Consequences
- The common case stays as ADR 0001 wrote it, and effect config and burst options stay apart, as in `fire()`.
- A caller who sets options but no config passes `undefined` or `{}` as the third argument.
- The README (PR 12) documents the four arguments, and its "from v2" table maps v2's flat config onto the config and the options.
