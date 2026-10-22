# 0021. The atlas loads sprites asynchronously, and a burst waits for them

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
Shapes, emoji and `draw` functions can be rasterised into the atlas synchronously with the Canvas 2D API. SVG markup cannot: it has to be loaded into an image and decoded first, which is asynchronous. Balloons (PR 7) use an SVG sprite.

Options considered:
- An asynchronous atlas: a burst starts once its sprites are ready.
- Start at once and draw nothing for an SVG sprite until it decodes.
- Drop `{ svg }` from 3.0 and draw balloons with `Path2D`.

## Decision
- `atlas.load(sources, dpr)` returns a promise of the sprites' regions, in the order of `sources`. It rasterises synchronous sources immediately. Concurrent loads of the same source share one decode.
- `fire()` (PR 5) starts a burst's simulation once its sprites are loaded. Nothing is drawn with a missing sprite.
- If a sprite cannot be loaded (an SVG that fails to decode, or an atlas that is full), the promise rejects. `fire()` skips the burst and still calls `onComplete`, because rewards are decorative.

## Consequences
- The first burst with an SVG sprite starts a frame or two late, while the image decodes. Later bursts find it cached.
- Every burst starts at least one microtask after `fire()`, even when its sprites are cached. `fire()` still returns `{ cancel, finished }` synchronously.
- Custom effects can use SVG markup.
