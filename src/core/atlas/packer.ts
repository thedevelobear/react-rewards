import type { Point } from '@/core/math';

/** Places rectangles in rows ("shelves"), left to right, top to bottom. */
export interface Packer {
  readonly width: number;
  readonly height: number;
  /** The top-left corner for a `width` by `height` box, or undefined if full. */
  pack(width: number, height: number): Point | undefined;
  /** Enlarges the area. Boxes already placed keep their positions. */
  grow(width: number, height: number): void;
}

interface Shelf {
  readonly y: number;
  readonly height: number;
  x: number;
}

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
