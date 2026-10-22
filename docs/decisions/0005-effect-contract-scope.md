# 0005. The 3.0 effect contract has `spawn` and `update` only

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
The original plan proposed two optional hooks on `defineEffect`. `onPointerDown(x, y, ctx)` would keep v2's balloon click-to-pop. A spawn `rate` would support continuous emitters such as snow and rain. The maintainer answered that click-to-pop is no longer needed. None of the three 3.0 effects is a continuous emitter.

## Decision
- `defineEffect` in 3.0 takes `name`, `blend`, `defaults`, `sprites`, `spawn` and `update`. `update` can spawn child particles through its context.
- There is no `onPointerDown` hook. Balloons are no longer clickable.
- The spawn `rate` is deferred until an effect needs it.

## Consequences
- The overlay canvas never needs pointer events, so `pointer-events: none` holds without exceptions.
- Balloons lose click-to-pop compared with v2. The README's "from v2" table mentions it.
- Adding either hook later is an additive change to the contract. It needs a new ADR, and the import restrictions for effects still apply.
