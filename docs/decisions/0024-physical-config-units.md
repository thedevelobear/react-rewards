# 0024. Effect configs use physical units

- **Status:** Accepted
- **Date:** 2026-10-22

Sizes are in CSS pixels, `velocity` in px/s, `gravity` in px/s² pointing down, `drag` per second (a drag of 3 multiplies velocity by e^-3 each second), and `lifetime` in milliseconds. `angle` and `spread` are in degrees: `angle` is counter-clockwise from the positive x axis, so 90 is straight up, and `spread` is the cone's full width.

**Why:** A config value is the number effect code works with, so no effect converts v2's per-frame numbers, and built-in and custom effects read the same way.

**Consequences:** v2's numbers don't map one to one, so the README's "from v2" table names the new units.
