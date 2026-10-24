# 0020. Sprite sources carry their size in CSS pixels

- **Status:** Accepted
- **Date:** 2026-10-22

Every sprite source states its size in CSS pixels: `{ shape: 'rect', color, width, height }`, `{ shape: 'circle', color, size }`, `{ emoji, size }`, `{ svg, width, height }` and `{ key, width, height, draw(ctx, width, height) }`. The atlas rasterises each one at its size times the device pixel ratio, cached by source, size and ratio. A particle is drawn at its sprite's size times `scale * scaleX` and `scale * scaleY`.

**Why:** Sprites stay sharp at any size and on any display, and an effect's `size` config feeds straight into `sprites(config)`.

**Consequences:** Each size is its own atlas entry, so the atlas is cleared when the overlay is removed after idling.
