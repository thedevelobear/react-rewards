import type { SpriteSource } from '@/core/define-effect';
import type { Point } from '@/core/math';

/** Where a sprite sits in the atlas, and how big it is drawn. */
export interface Region {
  /** The source rectangle, in atlas pixels. */
  readonly sx: number;
  readonly sy: number;
  readonly sw: number;
  readonly sh: number;
  /** The drawn size in CSS pixels, before the particle's scale. */
  readonly width: number;
  readonly height: number;
}

/** Every effect's sprites, packed into one canvas. */
export interface Atlas {
  /**
   * The atlas image. It is replaced by a larger canvas when the atlas grows,
   * so read it from here on every frame.
   */
  readonly canvas: HTMLCanvasElement;
  /** Changes whenever the atlas pixels change, so a texture can re-upload. */
  readonly version: number;
  /**
   * Rasterises the sources that are not cached yet, at `dpr` device pixels
   * per CSS pixel, and resolves to their regions in the same order. Rejects
   * if an SVG fails to decode or the atlas is full (ADR 0021).
   */
  load(sources: readonly SpriteSource[], dpr: number): Promise<Region[]>;
  /** Forgets every sprite and shrinks the canvas back to its initial size. */
  clear(): void;
}

export interface AtlasOptions {
  /** Creates the atlas canvas. Defaults to `document.createElement`. */
  readonly createCanvas?: (width: number, height: number) => HTMLCanvasElement;
  /** Decodes SVG markup. Defaults to an `Image` with a data URL. */
  readonly loadImage?: (svg: string) => Promise<CanvasImageSource>;
  /** The starting side length in pixels. Defaults to 256. */
  readonly initialSize?: number;
  /** The largest side length in pixels. Defaults to 2048. */
  readonly maxSize?: number;
}

/** Places rectangles in rows ("shelves"), left to right, top to bottom. */
export interface Packer {
  readonly width: number;
  readonly height: number;
  /** The top-left corner for a `width` by `height` box, or undefined if full. */
  pack(width: number, height: number): Point | undefined;
  /** Enlarges the area. Boxes already placed keep their positions. */
  grow(width: number, height: number): void;
}

/** One row of the packer, filled from the left. */
export interface Shelf {
  readonly y: number;
  readonly height: number;
  x: number;
}

/** A sprite's drawn size in CSS pixels. */
export interface SpriteSize {
  width: number;
  height: number;
}
