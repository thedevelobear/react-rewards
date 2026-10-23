# 0047. A burst says which renderer it was given

- **Status:** Proposed
- **Date:** 2026-10-23

## Context
The site's stress page shows the active renderer next to its fps readout (plan, step 3). The demo imports the built package ([ADR 0031](0031-demo-imports-built-package.md)), so it can only learn the renderer through a public export. PR 6 added `setRenderer` ([ADR 0033](0033-strict-public-set-renderer.md)) but no way to read the result. Its specs find the overlay canvas and check the kind of context it has, which depends on the library's internals.

The renderer is created on the first burst and removed after the overlay idles, and under `'auto'` it can be WebGL2 or Canvas 2D. The answer can also differ from the preference: a forced renderer the browser can't provide skips bursts.

Options considered (plan, open question 7):
- `Burst` gains a `renderer` field, set when `fire()` returns.
- A page-wide `getRenderer()`, which returns the current overlay's renderer, or undefined when no overlay is mounted (before the first burst, and after the overlay idles).
- No public API. The demo reads the overlay canvas's context, as the specs do.

## Decision
- `Burst` gains `readonly renderer: RendererKind | undefined`, where `RendererKind` is `'webgl' | 'canvas'`.
- It is the kind of renderer the burst claimed with the overlay, and it is set before `fire()` returns. It doesn't change afterwards.
- It is undefined when the burst was skipped before it claimed the overlay: under reduced motion, from an empty ref, or when no renderer is available.
- A burst skipped later still names its renderer. That happens when its config, its sprites or its simulation throw, or its sprites fail to load. `finished` says how it ended ([ADR 0025](0025-cancel-skips-on-complete.md)).
- `src/index.ts` also exports the `RendererKind` type. This adds to the export list in [ADR 0028](0028-public-exports-from-pr-5.md).
- The hook's `reward()` returns the burst ([ADR 0042](0042-reward-returns-burst.md)), so `useReward` callers get the field with no change to the hook.

## Consequences
- The answer belongs to a burst, so it is right for bursts that run while `setRenderer` changes the choice. Bursts already running finish on the old renderer ([ADR 0033](0033-strict-public-set-renderer.md)).
- Code can't ask which renderer the next burst will get without firing one. A `getRenderer()` can be added later without breaking callers.
- The browser specs can check `burst.renderer` against the overlay's context, so the field is tested against what drew.
