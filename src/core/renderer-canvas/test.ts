import { describe, expect, it } from '@rstest/core';
import type { Atlas, Region } from '@/core/atlas';
import { createPool, type Pool } from '@/core/pool';
import type { Batch } from '@/core/renderer';
import { createCanvasRenderer } from '@/core/renderer-canvas';
import { type Call, createFakeContext } from '@/test-utils';

const atlasCanvas = {} as HTMLCanvasElement;
const atlas = { canvas: atlasCanvas, version: 1 } as Atlas;

const regions: Region[] = [
  { sx: 2, sy: 2, sw: 16, sh: 10, width: 8, height: 5 },
  { sx: 20, sy: 2, sw: 40, sh: 40, width: 20, height: 20 },
];

const setup = (dpr = 1) => {
  const { ctx, calls } = createFakeContext();
  const canvas = { width: 0, height: 0 } as HTMLCanvasElement;
  const renderer = createCanvasRenderer(canvas, ctx);
  renderer.resize(400, 300, dpr);
  calls.length = 0;
  return { canvas, renderer, calls };
};

const particle = (pool: Pool, fields: Partial<Record<string, number>>) => {
  const index = pool.alloc();
  for (const [field, value] of Object.entries(fields)) {
    const array = pool.fields[field as keyof Pool['fields']];
    array[index] = value ?? 0;
  }
};

const named = (calls: Call[], name: string) =>
  calls.filter(([call]) => call === name);

describe('createCanvasRenderer', () => {
  it('sizes the drawing buffer in device pixels', () => {
    const { canvas, renderer } = setup();
    renderer.resize(401, 300, 1.5);
    expect([canvas.width, canvas.height]).toEqual([602, 450]);
    expect(renderer.kind).toBe('canvas');
  });

  it('clears, then draws each particle from the atlas', () => {
    const { renderer, calls } = setup(2);
    const pool = createPool();
    particle(pool, { x: 100, y: 50, scale: 2, scaleY: 0.5, alpha: 0.5 });
    renderer.draw({ atlas, batches: [{ pool, regions, blend: 'normal' }] });

    expect(calls.slice(0, 2)).toEqual([
      ['setTransform', 1, 0, 0, 1, 0, 0],
      ['clearRect', 0, 0, 800, 600],
    ]);
    expect(calls).toContainEqual(['globalCompositeOperation=', 'source-over']);
    expect(calls).toContainEqual(['globalAlpha=', 0.5]);
    // Scale 2 × dpr 2 = 4 across, × scaleY 0.5 = 2 down, at (200, 100).
    expect(calls).toContainEqual(['setTransform', 4, 0, -0, 2, 200, 100]);
    expect(named(calls, 'drawImage')).toEqual([
      ['drawImage', atlasCanvas, 2, 2, 16, 10, -4, -2.5, 8, 5],
    ]);
  });

  it('rotates around the particle centre', () => {
    const { renderer, calls } = setup();
    const pool = createPool();
    particle(pool, { x: 10, y: 20, rotation: Math.PI / 2 });
    renderer.draw({ atlas, batches: [{ pool, regions, blend: 'normal' }] });
    const transform = named(calls, 'setTransform')[1] ?? [];
    const [, a, b, c, d, e, f] = transform as number[];
    expect(a).toBeCloseTo(0, 6);
    expect(b).toBeCloseTo(1, 6);
    expect(c).toBeCloseTo(-1, 6);
    expect(d).toBeCloseTo(0, 6);
    expect([e, f]).toEqual([10, 20]);
  });

  it('picks the region by sprite, and flips with a negative scale', () => {
    const { renderer, calls } = setup();
    const pool = createPool();
    particle(pool, { sprite: 1, scaleX: -1 });
    renderer.draw({ atlas, batches: [{ pool, regions, blend: 'normal' }] });
    expect(named(calls, 'setTransform')[1]).toEqual([
      'setTransform',
      -1,
      -0,
      -0,
      1,
      0,
      0,
    ]);
    expect(named(calls, 'drawImage')[0]?.slice(2, 6)).toEqual([20, 2, 40, 40]);
  });

  it('skips particles that are invisible or have no sprite', () => {
    const { renderer, calls } = setup();
    const pool = createPool();
    particle(pool, { alpha: 0 });
    particle(pool, { scale: 0 });
    particle(pool, { scaleY: 0 });
    particle(pool, { sprite: 7 });
    particle(pool, { sprite: -1 });
    particle(pool, { x: 5 });
    renderer.draw({ atlas, batches: [{ pool, regions, blend: 'normal' }] });
    expect(named(calls, 'drawImage')).toHaveLength(1);
  });

  it('composites additive batches with lighter, in batch order', () => {
    const { renderer, calls } = setup();
    const glow = createPool();
    particle(glow, {});
    const plain = createPool();
    particle(plain, {});
    const batches: Batch[] = [
      { pool: glow, regions, blend: 'additive' },
      { pool: plain, regions, blend: 'normal' },
    ];
    renderer.draw({ atlas, batches });
    const modes = named(calls, 'globalCompositeOperation=').map(([, v]) => v);
    expect(modes).toEqual(['lighter', 'source-over', 'source-over']);
  });

  it('caps alpha at 1 and resets the context state afterwards', () => {
    const { renderer, calls } = setup();
    const pool = createPool();
    particle(pool, { alpha: 3 });
    renderer.draw({ atlas, batches: [{ pool, regions, blend: 'additive' }] });
    expect(calls).toContainEqual(['globalAlpha=', 1]);
    expect(calls.slice(-3)).toEqual([
      ['globalAlpha=', 1],
      ['globalCompositeOperation=', 'source-over'],
      ['setTransform', 1, 0, 0, 1, 0, 0],
    ]);
  });

  it('clears on clear(), and frees the buffer on dispose()', () => {
    const { canvas, renderer, calls } = setup();
    renderer.clear();
    expect(calls).toEqual([
      ['setTransform', 1, 0, 0, 1, 0, 0],
      ['clearRect', 0, 0, 400, 300],
    ]);
    renderer.dispose();
    expect([canvas.width, canvas.height]).toEqual([0, 0]);
  });
});
