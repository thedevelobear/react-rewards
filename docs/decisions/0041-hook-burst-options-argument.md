# 0041. The hook takes the burst options as a fourth argument

- **Status:** Accepted
- **Date:** 2026-10-23

The signature is `useReward(target, effect, config?, options?)`. `target` is an element or a ref. `config` is a `Partial` of the effect's config. `options` is `fire()`'s options without `origin` and `config`, so any new burst option reaches the hook too. `RewardTarget`, `RewardOptions` and `UseRewardResult` are exported.

**Why:** The common case stays `useReward(ref, effect, config)` ([ADR 0001](0001-v3-direction.md)), and config and burst options stay apart, as in `fire()` ([ADR 0023](0023-fire-options-beside-config.md)).

**Consequences:** Options without a config need `undefined` or `{}` as the third argument.
