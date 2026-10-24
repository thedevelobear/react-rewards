# 0047. A burst says which renderer it was given

- **Status:** Accepted
- **Date:** 2026-10-23

`Burst` has `readonly renderer: RendererKind | undefined`, where `RendererKind` (exported) is `'webgl' | 'canvas'`. It is set before `fire()` returns and never changes. It is undefined when the burst was skipped before claiming the overlay: under reduced motion, from an empty ref, or with no renderer available.

**Why:** The Stress test page shows the renderer, and the demo can only learn it through the public API. A page-wide `getRenderer()` would be wrong for bursts running across a `setRenderer` change.

**Consequences:** Code can't ask which renderer the next burst will get without firing one.
