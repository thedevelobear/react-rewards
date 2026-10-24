# 0044. `reward` passed as an event handler fires from the pointer

- **Status:** Accepted
- **Date:** 2026-10-23

- `reward` also takes an event with a pointer position, any object with finite `clientX` and `clientY`, and fires from that point. Its argument type is `Origin | PositionedEvent`, so `onClick={reward}` type-checks.
- A `click` with `detail` 0, from the keyboard or `element.click()`, fires from the target.
- Anything else that isn't a valid origin fires from the target, including no argument, a keyboard event, or a point with a non-finite `x` or `y`.
- `fire()` doesn't change.

**Why:** v2's README passes `reward` straight to `onClick`. In v3 the event would be read as a point with no `x` or `y`, and the burst would draw nothing, with no warning in plain JavaScript.

**Consequences:** `onClick={reward}` starts the burst at the click rather than at the element, and `onClick={() => reward()}` starts it at the element. `onTouchStart={reward}` fires from the target.
