# 0028. The public exports after PR 5

- **Status:** Accepted. The math helpers bullet is superseded by [0053](0053-public-math-helpers.md).
- **Date:** 2026-10-22

- `src/index.ts` exports `fire`, `confetti` and `defineEffect`, and the types in their signatures.
- The math helpers stay internal.
- Emoji and balloons return in PR 7, and `useReward` in PR 8.

**Why:** Custom effects made with `defineEffect` should work like the built-in ones from the first release of the API.

**Consequences:** The integration branch has no hook between PR 5 and PR 8. Nothing is released from it until PR 12.
