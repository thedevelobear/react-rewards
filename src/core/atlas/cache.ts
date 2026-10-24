import type { SpriteSource } from '@/core/define-effect';
import { createPacker } from './packer';
import { drawSprite, loadSvgImage, spriteKey, spriteSize } from './raster';
import type { Atlas, AtlasOptions, Region } from './types';

/** Pixels between sprites, so they don't bleed into each other. */
const PADDING = 2;

const createDomCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const context2d = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('The sprite atlas needs a 2D canvas context.');
  return ctx;
};

/**
 * Creates an empty atlas. Its canvas is made on first use, so creating one
 * during server rendering is safe. It doubles in size when full, up to
 * `maxSize` (2048 by default, the smallest maximum texture size WebGL2
 * guarantees).
 */
export const createAtlas = (options: AtlasOptions = {}): Atlas => {
  const {
    createCanvas = createDomCanvas,
    loadImage = loadSvgImage,
    initialSize = 256,
    maxSize = 2048,
  } = options;
  let canvas: HTMLCanvasElement | undefined;
  let packer = createPacker(initialSize, initialSize, PADDING);
  let version = 0;
  const regions = new Map<string, Region>();
  const pending = new Map<string, Promise<Region>>();

  const currentCanvas = (): HTMLCanvasElement => {
    canvas ??= createCanvas(initialSize, initialSize);
    return canvas;
  };

  /** Doubles the canvas and copies what it holds. False at `maxSize`. */
  const grow = (): boolean => {
    const side = Math.max(packer.width, packer.height);
    if (side >= maxSize) return false;
    const next = createCanvas(
      Math.min(side * 2, maxSize),
      Math.min(side * 2, maxSize)
    );
    context2d(next).drawImage(currentCanvas(), 0, 0);
    canvas = next;
    packer.grow(next.width, next.height);
    version += 1;
    return true;
  };

  const place = (
    source: SpriteSource,
    dpr: number,
    image?: CanvasImageSource
  ): Region => {
    const { width, height } = spriteSize(source);
    const sw = Math.ceil(width * dpr);
    const sh = Math.ceil(height * dpr);
    if (sw + PADDING * 2 > maxSize || sh + PADDING * 2 > maxSize) {
      throw new RangeError(
        `A ${sw}x${sh} px sprite does not fit a ${maxSize} px atlas.`
      );
    }
    let point = packer.pack(sw, sh);
    while (!point) {
      if (!grow()) throw new RangeError('The sprite atlas is full.');
      point = packer.pack(sw, sh);
    }
    const ctx = context2d(currentCanvas());
    ctx.setTransform(dpr, 0, 0, dpr, point.x, point.y);
    drawSprite(ctx, source, image);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    version += 1;
    return { sx: point.x, sy: point.y, sw, sh, width, height };
  };

  const loadOne = (
    source: SpriteSource,
    dpr: number
  ): Region | Promise<Region> => {
    const key = `${spriteKey(source)}@${dpr}`;
    const cached = regions.get(key);
    if (cached) return cached;
    if (!('svg' in source)) {
      const region = place(source, dpr);
      regions.set(key, region);
      return region;
    }
    const inFlight = pending.get(key);
    if (inFlight) return inFlight;
    const promise = loadImage(source.svg)
      .then((image) => {
        const region = place(source, dpr, image);
        regions.set(key, region);
        return region;
      })
      .finally(() => {
        if (pending.get(key) === promise) pending.delete(key);
      });
    pending.set(key, promise);
    return promise;
  };

  return {
    get canvas() {
      return currentCanvas();
    },
    get version() {
      return version;
    },
    load: (sources, dpr) => {
      try {
        return Promise.all(sources.map((source) => loadOne(source, dpr)));
      } catch (error) {
        return Promise.reject(error);
      }
    },
    clear: () => {
      regions.clear();
      pending.clear();
      packer = createPacker(initialSize, initialSize, PADDING);
      canvas = undefined;
      version += 1;
    },
  };
};
