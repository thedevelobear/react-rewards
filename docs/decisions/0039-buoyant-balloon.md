# 0039. Balloons are redesigned, and rise by negative gravity

- **Status:** Accepted
- **Date:** 2026-10-23

Balloons rise by a negative `gravity`, which works as buoyancy: each settles at `-gravity / drag`, with gravity varied by ±20% so they spread out. Each sways around its path and tilts with the sway, so the string trails. Each colour is one sprite, v2's `balloon.svg` with the colour baked in. Balloons fade over the last 20% of their life, and can't be popped ([ADR 0005](0005-effect-contract-scope.md)).

**Why:** `gravity` keeps one meaning across effects ([ADR 0024](0024-physical-config-units.md)). The engine has no tint, so v2's `currentColor` fill can't be coloured at draw time.

**Consequences:** Balloons rise faster than v2's and look different. A positive `gravity` makes them fall.
