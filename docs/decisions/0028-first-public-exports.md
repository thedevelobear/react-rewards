# 0028. The first public exports are `fire`, `confetti` and `defineEffect`

- **Status:** Accepted. The math helpers bullet is superseded by [0053](0053-public-math-helpers.md).
- **Date:** 2026-10-22

- `src/index.ts` exports `fire`, `confetti` and `defineEffect`, and the types in their signatures.
- The math helpers stay internal.
- Emoji and balloons return with their effects, and `useReward` with the hook.

**Why:** Custom effects made with `defineEffect` should work like the built-in ones from the first release of the API.

**Consequences:** The integration branch has no hook until it is rewritten. Nothing is released from the integration branch in between.
