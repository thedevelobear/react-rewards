import { describe, expect, it } from '@rstest/core';
import { createAtlas } from '@/core/atlas';
import type { SpriteSource } from '@/core/define-effect';
import { createRng } from '@/core/math';
import { createFakeCanvases, createFakeContext } from '@/test-utils';
import { createPacker } from './packer';
import { drawSprite, EMOJI_BOX, spriteKey, spriteSize } from './raster';

const rect = (color = '#f00', width = 8, height = 5): SpriteSource => ({
  shape: 'rect',
  color,
  width,
  height,
});

describe('createPacker', () => {
  it('fills a shelf left to right, with padding around each box', () => {
    const packer = createPacker(64, 64, 2);
    expect(packer.pack(10, 10)).toEqual({ x: 2, y: 2 });
    expect(packer.pack(10, 10)).toEqual({ x: 14, y: 2 });
    expect(packer.pack(10, 8)).toEqual({ x: 26, y: 2 });
  });

  it('opens a new shelf when a box is too wide or too tall', () => {
    const packer = createPacker(32, 64, 2);
    packer.pack(20, 10);
    expect(packer.pack(20, 10)).toEqual({ x: 2, y: 14 });
    expect(packer.pack(4, 20)).toEqual({ x: 2, y: 26 });
  });

  it('keeps small boxes off shelves more than twice their height', () => {
    const packer = createPacker(64, 64, 0);
    packer.pack(10, 30);
    expect(packer.pack(10, 10)).toEqual({ x: 0, y: 30 });
  });

  it('returns undefined when full, and fits more after growing', () => {
    const packer = createPacker(16, 16, 2);
    expect(packer.pack(12, 12)).toEqual({ x: 2, y: 2 });
    expect(packer.pack(12, 12)).toBeUndefined();
    packer.grow(32, 32);
    expect(packer.width).toBe(32);
    expect(packer.pack(12, 12)).toEqual({ x: 16, y: 2 });
  });

  it('never overlaps boxes or crosses its edges', () => {
    const rng = createRng(11);
    const packer = createPacker(256, 256, 2);
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    for (let i = 0; i < 400; i++) {
      const w = rng.int(1, 40);
      const h = rng.int(1, 40);
      const point = packer.pack(w, h);
      if (point) placed.push({ ...point, w, h });
    }
    expect(placed.length).toBeGreaterThan(50);
    for (const [i, a] of placed.entries()) {
      expect(a.x >= 2 && a.y >= 2).toBe(true);
      expect(a.x + a.w + 2 <= 256 && a.y + a.h + 2 <= 256).toBe(true);
      for (const b of placed.slice(i + 1)) {
        const apart =
          a.x + a.w + 2 <= b.x ||
          b.x + b.w + 2 <= a.x ||
          a.y + a.h + 2 <= b.y ||
          b.y + b.h + 2 <= a.y;
        expect(apart).toBe(true);
      }
    }
  });
});

describe('sprite sizes and keys', () => {
  it('measures each kind of source in CSS pixels', () => {
    expect(spriteSize(rect('#000', 8, 5))).toEqual({ width: 8, height: 5 });
    expect(spriteSize({ shape: 'circle', color: '#000', size: 6 })).toEqual({
      width: 6,
      height: 6,
    });
    expect(spriteSize({ emoji: '🎉', size: 20 })).toEqual({
      width: 20 * EMOJI_BOX,
      height: 20 * EMOJI_BOX,
    });
    expect(spriteSize({ svg: '<svg/>', width: 30, height: 40 })).toEqual({
      width: 30,
      height: 40,
    });
  });

  it('gives equal sources equal keys, and different ones different keys', () => {
    expect(spriteKey(rect())).toBe(spriteKey(rect()));
    const keys = [
      rect(),
      rect('#0f0'),
      rect('#f00', 9),
      { shape: 'circle', color: '#f00', size: 8 },
      { emoji: '🎉', size: 8 },
      { emoji: '🥳', size: 8 },
      { svg: '<svg/>', width: 8, height: 5 },
      { key: 'star', width: 8, height: 5, draw: () => {} },
    ].map((source) => spriteKey(source as SpriteSource));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('drawSprite', () => {
  it('clips to the box and fills a rect', () => {
    const { ctx, calls } = createFakeContext();
    drawSprite(ctx, rect('#123', 8, 5));
    expect(calls).toEqual([
      ['save'],
      ['beginPath'],
      ['rect', 0, 0, 8, 5],
      ['clip'],
      ['fillStyle=', '#123'],
      ['fillRect', 0, 0, 8, 5],
      ['restore'],
    ]);
  });

  it('fills a circle of the given diameter', () => {
    const { ctx, calls } = createFakeContext();
    drawSprite(ctx, { shape: 'circle', color: '#abc', size: 10 });
    expect(calls).toContainEqual(['arc', 5, 5, 5, 0, Math.PI * 2]);
    expect(calls).toContainEqual(['fill']);
  });

  it('centres an emoji in its box', () => {
    const { ctx, calls } = createFakeContext();
    drawSprite(ctx, { emoji: '🎉', size: 20 });
    const side = 20 * EMOJI_BOX;
    expect(calls).toContainEqual(['fillText', '🎉', side / 2, side / 2]);
    expect(calls).toContainEqual(['textAlign=', 'center']);
    expect(calls).toContainEqual(['textBaseline=', 'middle']);
  });

  it('draws a decoded SVG, and hands a draw function its box', () => {
    const { ctx, calls } = createFakeContext();
    const image = {} as CanvasImageSource;
    drawSprite(ctx, { svg: '<svg/>', width: 30, height: 40 }, image);
    expect(calls).toContainEqual(['drawImage', image, 0, 0, 30, 40]);

    const seen: unknown[] = [];
    drawSprite(ctx, {
      key: 'k',
      width: 7,
      height: 9,
      draw: (target, width, height) => seen.push(target, width, height),
    });
    expect(seen[0]).toBe(ctx);
    expect(seen.slice(1)).toEqual([7, 9]);
  });
});

describe('createAtlas', () => {
  it('creates no canvas until a sprite is loaded', async () => {
    const fake = createFakeCanvases();
    const atlas = createAtlas({ createCanvas: fake.createCanvas });
    expect(fake.canvases).toHaveLength(0);
    await atlas.load([rect()], 1);
    expect(fake.canvases).toHaveLength(1);
  });

  it('rasterises at the pixel ratio and returns CSS sizes', async () => {
    const fake = createFakeCanvases();
    const atlas = createAtlas({ createCanvas: fake.createCanvas });
    const [region] = await atlas.load([rect('#f00', 8, 5)], 2);
    expect(region).toEqual({
      sx: 2,
      sy: 2,
      sw: 16,
      sh: 10,
      width: 8,
      height: 5,
    });

    const calls = fake.canvases[0]?.calls ?? [];
    expect(calls[0]).toEqual(['setTransform', 2, 0, 0, 2, 2, 2]);
    expect(calls).toContainEqual(['fillRect', 0, 0, 8, 5]);
    expect(calls.at(-1)).toEqual(['setTransform', 1, 0, 0, 1, 0, 0]);
  });

  it('returns regions in the order of the sources', async () => {
    const atlas = createAtlas({
      createCanvas: createFakeCanvases().createCanvas,
    });
    const regions = await atlas.load(
      [rect('#f00', 8, 5), { emoji: '🎉', size: 16 }, rect('#0f0', 3, 3)],
      1
    );
    expect(regions.map((r) => [r.width, r.height])).toEqual([
      [8, 5],
      [20, 20],
      [3, 3],
    ]);
  });

  it('caches by source and pixel ratio', async () => {
    const fake = createFakeCanvases();
    const atlas = createAtlas({ createCanvas: fake.createCanvas });
    const [first] = await atlas.load([rect()], 1);
    const version = atlas.version;
    const [again] = await atlas.load([rect()], 1);
    expect(again).toBe(first);
    expect(atlas.version).toBe(version);

    const [sharper] = await atlas.load([rect()], 2);
    expect(sharper?.sw).toBe(16);
    expect(atlas.version).toBeGreaterThan(version);
  });

  it('decodes an SVG once for concurrent loads', async () => {
    const fake = createFakeCanvases();
    const image = {} as CanvasImageSource;
    const decoded: string[] = [];
    const atlas = createAtlas({
      createCanvas: fake.createCanvas,
      loadImage: async (svg) => {
        decoded.push(svg);
        return image;
      },
    });
    const balloon: SpriteSource = { svg: '<svg/>', width: 30, height: 40 };
    const [a, b] = await Promise.all([
      atlas.load([balloon], 1),
      atlas.load([balloon], 1),
    ]);
    expect(decoded).toEqual(['<svg/>']);
    expect(a?.[0]).toBe(b?.[0]);
    expect(fake.canvases[0]?.calls).toContainEqual([
      'drawImage',
      image,
      0,
      0,
      30,
      40,
    ]);
  });

  it('rejects when an SVG fails to decode, and retries on the next load', async () => {
    let attempts = 0;
    const atlas = createAtlas({
      createCanvas: createFakeCanvases().createCanvas,
      loadImage: async () => {
        attempts += 1;
        if (attempts === 1) throw new Error('decode failed');
        return {} as CanvasImageSource;
      },
    });
    const balloon: SpriteSource = { svg: '<svg/>', width: 30, height: 40 };
    await expect(atlas.load([balloon], 1)).rejects.toThrow('decode failed');
    await expect(atlas.load([balloon], 1)).resolves.toHaveLength(1);
    expect(attempts).toBe(2);
  });

  it('doubles the canvas when full, keeping earlier regions', async () => {
    const fake = createFakeCanvases();
    const atlas = createAtlas({
      createCanvas: fake.createCanvas,
      initialSize: 32,
    });
    const [first] = await atlas.load([rect('#000', 12, 12)], 1);
    const regions = await atlas.load(
      Array.from({ length: 20 }, (_, i) => rect(`#${i}`, 12, 12)),
      1
    );
    expect(fake.canvases.map((c) => c.width)).toEqual([32, 64, 128]);
    // Each new canvas starts with a copy of the one before.
    expect(fake.canvases[1]?.calls[0]).toEqual([
      'drawImage',
      fake.canvases[0],
      0,
      0,
    ]);
    expect(atlas.canvas).toBe(fake.canvases[2]);
    const [again] = await atlas.load([rect('#000', 12, 12)], 1);
    expect(again).toBe(first);
    expect(regions).toHaveLength(20);
  });

  it('rejects a sprite larger than the atlas can be, and a full atlas', async () => {
    const atlas = createAtlas({
      createCanvas: createFakeCanvases().createCanvas,
      initialSize: 32,
      maxSize: 32,
    });
    await expect(atlas.load([rect('#000', 40, 4)], 1)).rejects.toThrow(
      RangeError
    );
    await atlas.load([rect('#000', 12, 12)], 1);
    await atlas.load([rect('#001', 12, 12)], 1);
    await atlas.load([rect('#002', 12, 12)], 1);
    await atlas.load([rect('#003', 12, 12)], 1);
    await expect(atlas.load([rect('#004', 12, 12)], 1)).rejects.toThrow('full');
  });

  it('forgets everything on clear and starts a fresh canvas', async () => {
    const fake = createFakeCanvases();
    const atlas = createAtlas({ createCanvas: fake.createCanvas });
    await atlas.load([rect()], 1);
    const version = atlas.version;
    atlas.clear();
    expect(atlas.version).toBe(version + 1);
    await atlas.load([rect()], 1);
    expect(fake.canvases).toHaveLength(2);
    expect(fake.canvases[1]?.calls).toContainEqual(['fillRect', 0, 0, 8, 5]);
  });

  it('rejects when the canvas has no 2D context', async () => {
    const atlas = createAtlas({
      createCanvas: () =>
        ({
          width: 1,
          height: 1,
          getContext: () => null,
        }) as unknown as HTMLCanvasElement,
    });
    await expect(atlas.load([rect()], 1)).rejects.toThrow('2D canvas context');
  });
});
