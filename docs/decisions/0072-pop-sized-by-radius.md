# 0072. A pop's size is a `radius` in pixels, not its element's box

- **Status:** Proposed
- **Date:** 2026-10-31

How far a pop reaches is `radius`, a setting of its config in CSS pixels: its long streaks' stars land that far from where it starts. Neither the engine nor the API reads the size of the element a reward fires from. A pop starts where any burst does: at the element's centre, or at the pointer when `reward` is passed as an event handler ([ADR 0044](0044-reward-handles-pointer-events.md)).

**Why:** Fitting the pop to its element would change the effect contract and the API for one effect. A size in pixels is in the units the other settings use ([ADR 0024](0024-physical-config-units.md)).

**Consequences:** A pop doesn't grow with its element. The default, 60 px, suits a like button, and a bigger button needs a bigger `radius`.
