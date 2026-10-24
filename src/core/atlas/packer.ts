import type { Packer, Shelf } from './types';

/**
 * Creates a shelf packer with `padding` pixels around every box, so that
 * neighbouring sprites never bleed into each other when sampled.
 */
export const createPacker = (
  initialWidth: number,
  initialHeight: number,
  padding: number
): Packer => {
  let width = initialWidth;
  let height = initialHeight;
  const shelves: Shelf[] = [];
  let bottom = padding;

  return {
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    pack: (boxWidth, boxHeight) => {
      const cellWidth = boxWidth + padding;
      const cellHeight = boxHeight + padding;
      // Reuse a shelf that is tall enough but not more than twice too tall,
      // so small sprites don't waste the space of a tall row.
      for (const shelf of shelves) {
        if (
          shelf.height >= cellHeight &&
          shelf.height <= cellHeight * 2 &&
          shelf.x + cellWidth <= width
        ) {
          const point = { x: shelf.x, y: shelf.y };
          shelf.x += cellWidth;
          return point;
        }
      }
      if (padding + cellWidth > width || bottom + cellHeight > height) {
        return undefined;
      }
      shelves.push({ y: bottom, height: cellHeight, x: padding + cellWidth });
      const point = { x: padding, y: bottom };
      bottom += cellHeight;
      return point;
    },
    grow: (nextWidth, nextHeight) => {
      width = Math.max(width, nextWidth);
      height = Math.max(height, nextHeight);
    },
  };
};
