# 0071. The pop draws with the normal blend, with halos baked into its sprites

- **Status:** Accepted
- **Date:** 2026-10-31

The pop's `blend` is `'normal'`. Its glow is drawn into its sprites: each star, streak and ring dot has a soft halo, a gradient of its colour, and the flash is a gradient that is paler in the middle ([ADR 0069](0069-pop-blooms-in-closed-form.md)).

**Why:** A pop is meant for buttons on any page, light or dark. The additive blend adds light, so on a white page it adds nothing and the pop vanishes. The normal blend shows the same pop on white and on near-black.

**Consequences:** Where halos overlap they don't brighten each other, as the firework's additive glows do. A colour the canvas can't read back is drawn without a halo.
