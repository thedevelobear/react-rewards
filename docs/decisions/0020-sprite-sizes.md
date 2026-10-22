# 0020. Sprite sources carry their size in CSS pixels

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
[ADR 0019](0019-particle-contract.md) listed the sprite sources (`{ shape, color }`, `{ emoji }`, `{ svg }`, `{ key, draw }`) without a size, and left them for PR 4 to refine. The atlas rasterises each sprite once, so it needs a pixel size, and the renderers need to know how big to draw it. The plan did not say where that size comes from.

Options considered:
- Each source carries its size in CSS pixels. The atlas rasterises it at that size times the device pixel ratio.
- Every sprite is rasterised at one fixed resolution, and effects scale particles to the size they want.

## Decision
- Every sprite source states its size in CSS pixels:
  - `{ shape: 'rect', color, width, height }`
  - `{ shape: 'circle', color, size }` (the diameter)
  - `{ emoji, size }` (the font size)
  - `{ svg, width, height }`
  - `{ key, width, height, draw(ctx, width, height) }`. `ctx` is already scaled and translated, so `draw` paints the box from (0, 0) to (`width`, `height`) in CSS pixels.
- The atlas rasterises a source at its size times the device pixel ratio, rounded up to whole pixels. It caches the result by source, size and ratio.
- A particle is drawn at its sprite's CSS size times `scale * scaleX` and `scale * scaleY`.

## Consequences
- Sprites stay sharp at any size and on any display. An effect's `size` config feeds straight into `sprites(config)`.
- Each distinct size is its own atlas entry. A slider that sweeps `size` (the demo in PR 10) adds entries as it moves. The atlas is cleared when the overlay is disposed after idling.
- Moving the page to a display with a different pixel ratio adds entries at the new ratio, rather than invalidating the regions that running bursts hold.
