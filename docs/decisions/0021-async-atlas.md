# 0021. The atlas loads sprites asynchronously, and a burst waits for them

- **Status:** Accepted
- **Date:** 2026-10-22

`atlas.load(sources, dpr)` returns a promise of the sprites' regions. Concurrent loads of one source share a decode. `fire()` starts a burst once its sprites are loaded. If one fails to load, the burst is skipped and `onComplete` is still called.

**Why:** SVG markup has to be decoded as an image, which is asynchronous, and balloons use an SVG sprite. Starting at once would draw the burst without its SVG sprites until they decode.

**Consequences:** The first burst with a new SVG sprite starts a frame or two late. Every burst starts at least a microtask after `fire()`, which still returns synchronously.
