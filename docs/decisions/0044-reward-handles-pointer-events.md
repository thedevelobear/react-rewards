# 0044. `reward` passed as an event handler fires from the pointer

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
v2's `reward` took no arguments, and the v2 README passes it straight to a button: `onClick={reward}`. React calls a handler with the event, and the event was ignored.

In v3, `reward`'s first argument is the origin ([ADR 0042](0042-reward-returns-burst.md)), so `onClick={reward}` calls `reward(event)`. The event is neither an element nor a ref, so `fire()` reads it as a point. React's mouse events have `clientX` and `clientY` but no `x` or `y`, so every particle starts at `NaN`. The burst runs for its whole lifetime and calls `onComplete`, but draws nothing. TypeScript rejects `onClick={reward}`, because a click event isn't an `Origin`. Plain JavaScript gives no warning.

Options considered:
- Leave it. TypeScript users get an error, JavaScript users get a burst that draws nothing, and the README says to write `onClick={() => reward()}`.
- Ignore any argument that isn't an origin, so `onClick={reward}` fires from the target, as in v2.
- Use the event's pointer position, so `onClick={reward}` fires from where the user clicked.

## Decision
- `reward`'s argument can also be an event with a pointer position: any object whose `clientX` and `clientY` are finite numbers, such as React's or the DOM's mouse and pointer events. Its type is `Origin | PositionedEvent`, so `onClick={reward}` type-checks.
- Such an event fires from `(clientX, clientY)`, in viewport CSS pixels.
- A `click` whose `detail` is 0 came from the keyboard or from `element.click()`, so it has no real pointer position. It fires from the target. Only `click` is checked, because `pointerdown` always has a `detail` of 0.
- Anything else that isn't an origin fires from the target: no argument, an event without a pointer position (such as a keyboard or change event), or a point whose `x` or `y` isn't a finite number.
- `fire()` doesn't change. Its `origin` is an `Origin`.

## Consequences
- v2's `onClick={reward}` keeps working, but the burst starts at the click instead of at the element's centre. The README's "from v2" table (PR 12) says so, and shows `onClick={() => reward()}` for firing from the element.
- `onPointerDown={reward}` and `onMouseDown={reward}` fire from the pointer too. Touch events have no `clientX` of their own, so `onTouchStart={reward}` fires from the target, and TypeScript rejects it.
- A mistaken origin, such as a point with `NaN` in it, fires from the target instead of drawing nothing.
- `PositionedEvent` isn't exported from the index, just as `Measurable` and `TargetRef` aren't. It is part of `UseRewardResult`'s type.
