# 0005. The 3.0 effect contract has `spawn` and `update` only

- **Status:** Accepted
- **Date:** 2026-10-22

`defineEffect` takes `name`, `blend`, `defaults`, `sprites`, `spawn` and `update`, and `update` can spawn child particles. There is no `onPointerDown` hook, so balloons can't be popped. There is no spawn `rate` for continuous emitters until an effect needs one.

**Why:** Without click-to-pop, the overlay never needs pointer events. None of the 3.0 effects emits continuously.

**Consequences:** Either hook can be added later without breaking existing effects.
