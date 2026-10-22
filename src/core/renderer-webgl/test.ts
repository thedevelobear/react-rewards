import { describe, expect, it } from '@rstest/core';
import type { Atlas, Region } from '@/core/atlas';
import type { BlendMode } from '@/core/define-effect';
import { createPool, type Pool } from '@/core/pool';
import type { Batch } from '@/core/renderer';
import {
  createInstances,
  createProgram,
  createWebglRenderer,
  INSTANCE_FLOATS,
} from '@/core/renderer-webgl';
import { type Call, createFakeWebgl } from '@/test-utils';

const regions: Region[] = [
  { sx: 2, sy: 2, sw: 16, sh: 10, width: 8, height: 5 },
  { sx: 20, sy: 2, sw: 40, sh: 40, width: 20, height: 20 },
];

const particle = (pool: Pool, fields: Partial<Record<string, number>>) => {
  const index = pool.alloc();
  for (const [field, value] of Object.entries(fields)) {
    const array = pool.fields[field as keyof Pool['fields']];
    array[index] = value ?? 0;
  }
};

/** A batch of `count` default particles. */
const batch = (blend: BlendMode, count = 1): Batch => {
  const pool = createPool();
  for (let i = 0; i < count; i++) particle(pool, {});
  return { pool, regions, blend };
};

const named = (calls: Call[], name: string) =>
  calls.filter(([call]) => call === name);

describe('createInstances', () => {
  it('packs the centre, alpha, texel matrix and atlas box', () => {
    const instances = createInstances();
    const pool = createPool();
    particle(pool, { x: 100, y: 50, scale: 2, scaleY: 0.5, alpha: 0.5 });
    instances.write([{ pool, regions, blend: 'normal' }]);

    expect(instances.count).toBe(1);
    // 2 × 8 CSS px over 16 texels = 1 across; 2 × 0.5 × 5 over 10 = 0.5 down.
    expect(Array.from(instances.data.subarray(0, INSTANCE_FLOATS))).toEqual([
      100, 50, 0.5, 1, 0, -0, 0.5, 2, 2, 16, 10,
    ]);
  });

  it('rotates the matrix, flips with a negative scale, and caps alpha', () => {
    const instances = createInstances();
    const pool = createPool();
    particle(pool, { rotation: Math.PI / 2, scaleX: -1, alpha: 3, sprite: 1 });
    instances.write([{ pool, regions, blend: 'normal' }]);

    const [, , alpha, a, b, c, d, sx] = instances.data;
    expect(alpha).toBe(1);
    // 20 CSS px over 40 texels = 0.5, mirrored across.
    expect(a).toBeCloseTo(0, 6);
    expect(b).toBeCloseTo(-0.5, 6);
    expect(c).toBeCloseTo(-0.5, 6);
    expect(d).toBeCloseTo(0, 6);
    expect(sx).toBe(20);
  });

  it('skips the particles the Canvas 2D renderer skips', () => {
    const instances = createInstances();
    const pool = createPool();
    particle(pool, { alpha: 0 });
    particle(pool, { scale: 0 });
    particle(pool, { scaleY: 0 });
    particle(pool, { sprite: 7 });
    particle(pool, { sprite: -1 });
    particle(pool, { x: 5 });
    instances.write([{ pool, regions, blend: 'normal' }]);
    expect(instances.count).toBe(1);
    expect(instances.data[0]).toBe(5);
  });

  it('merges neighbouring batches with the same blend mode (ADR 0034)', () => {
    const instances = createInstances();
    instances.write([
      batch('normal', 2),
      batch('normal', 1),
      batch('additive', 3),
      batch('normal', 0),
      batch('normal', 1),
    ]);
    expect(instances.runs).toEqual([
      { blend: 'normal', start: 0, count: 3 },
      { blend: 'additive', start: 3, count: 3 },
      { blend: 'normal', start: 6, count: 1 },
    ]);
  });

  it('starts over on every write', () => {
    const instances = createInstances();
    instances.write([batch('normal', 2), batch('additive', 1)]);
    instances.write([batch('additive', 1)]);
    expect(instances.count).toBe(1);
    expect(instances.runs).toEqual([{ blend: 'additive', start: 0, count: 1 }]);
    instances.write([]);
    expect(instances.count).toBe(0);
    expect(instances.runs).toEqual([]);
  });

  it('grows past its capacity and keeps what it packed', () => {
    const instances = createInstances(2);
    const first = createPool();
    particle(first, { x: 1 });
    particle(first, { x: 2 });
    const second = createPool();
    for (let i = 0; i < 5; i++) particle(second, { x: 10 + i });
    instances.write([
      { pool: first, regions, blend: 'normal' },
      { pool: second, regions, blend: 'normal' },
    ]);
    expect(instances.count).toBe(7);
    const xs = Array.from({ length: 7 }, (_, i) => {
      return instances.data[i * INSTANCE_FLOATS];
    });
    expect(xs).toEqual([1, 2, 10, 11, 12, 13, 14]);
  });
});

const atlas = (version = 1) =>
  ({ canvas: { width: 256, height: 128 }, version }) as unknown as Atlas;

const setup = (onLost?: () => void) => {
  const canvas = Object.assign(new EventTarget(), { width: 0, height: 0 });
  const { gl, calls } = createFakeWebgl(canvas);
  const renderer = createWebglRenderer(
    canvas as unknown as HTMLCanvasElement,
    gl,
    onLost
  );
  renderer.resize(400, 300, 2);
  calls.length = 0;
  return { canvas, renderer, calls };
};

describe('createProgram', () => {
  it('links both shaders and deletes them once linked', () => {
    const canvas = { width: 0, height: 0 };
    const { gl, calls } = createFakeWebgl(canvas);
    const program = createProgram(gl);
    expect(program).toEqual({ id: 'Program1' });
    expect(named(calls, 'linkProgram')).toEqual([['linkProgram', program]]);
    expect(named(calls, 'deleteShader')).toHaveLength(2);
  });

  it('throws, and frees the program, when it fails to link', () => {
    const { gl, calls } = createFakeWebgl(
      { width: 0, height: 0 },
      { link: false }
    );
    expect(() => createProgram(gl)).toThrow('link failed');
    expect(named(calls, 'deleteProgram')).toEqual([
      ['deleteProgram', { id: 'Program1' }],
    ]);
  });
});

describe('createWebglRenderer', () => {
  it('sizes the drawing buffer in device pixels and sets the viewport', () => {
    const { canvas, renderer, calls } = setup();
    renderer.resize(401, 300, 1.5);
    expect([canvas.width, canvas.height]).toEqual([602, 450]);
    expect(calls).toEqual([['viewport', 0, 0, 602, 450]]);
    expect(renderer.kind).toBe('webgl');
  });

  it('clears, uploads the atlas and the particles, then draws once', () => {
    const { renderer, calls } = setup();
    const pool = createPool();
    particle(pool, { x: 100, y: 50 });
    particle(pool, { x: 200, y: 50 });
    renderer.draw({
      atlas: atlas(),
      batches: [{ pool, regions, blend: 'normal' }],
    });

    expect(calls[0]).toEqual(['clear', 'COLOR_BUFFER_BIT']);
    expect(named(calls, 'texImage2D')).toEqual([
      [
        'texImage2D',
        'TEXTURE_2D',
        0,
        'RGBA',
        'RGBA',
        'UNSIGNED_BYTE',
        { width: 256, height: 128 },
      ],
    ]);
    expect(calls).toContainEqual(['uniform2f', 'u_texel', 1 / 256, 1 / 128]);
    // 800 × 600 device pixels at dpr 2.
    expect(calls).toContainEqual(['uniform2f', 'u_view', 4 / 800, -4 / 600]);
    const [[, target, data, ...rest] = []] = named(calls, 'bufferData');
    expect(target).toBe('ARRAY_BUFFER');
    expect((data as number[])[0]).toBe(100);
    expect((data as number[])[INSTANCE_FLOATS]).toBe(200);
    expect(rest).toEqual(['DYNAMIC_DRAW', 0, 2 * INSTANCE_FLOATS]);
    expect(named(calls, 'blendFunc')).toEqual([
      ['blendFunc', 'ONE', 'ONE_MINUS_SRC_ALPHA'],
    ]);
    expect(named(calls, 'drawArraysInstanced')).toEqual([
      ['drawArraysInstanced', 'TRIANGLE_STRIP', 0, 4, 2],
    ]);
  });

  it('uploads the atlas again only when its version changes', () => {
    const { renderer, calls } = setup();
    const batches = [batch('normal')];
    renderer.draw({ atlas: atlas(1), batches });
    renderer.draw({ atlas: atlas(1), batches });
    expect(named(calls, 'texImage2D')).toHaveLength(1);
    renderer.draw({ atlas: atlas(2), batches });
    expect(named(calls, 'texImage2D')).toHaveLength(2);
  });

  it('draws each run with its blend mode, from its place in the buffer', () => {
    const { renderer, calls } = setup();
    renderer.draw({
      atlas: atlas(),
      batches: [batch('normal', 2), batch('additive', 3)],
    });
    expect(named(calls, 'blendFunc')).toEqual([
      ['blendFunc', 'ONE', 'ONE_MINUS_SRC_ALPHA'],
      ['blendFunc', 'ONE', 'ONE'],
    ]);
    expect(named(calls, 'drawArraysInstanced')).toEqual([
      ['drawArraysInstanced', 'TRIANGLE_STRIP', 0, 4, 2],
      ['drawArraysInstanced', 'TRIANGLE_STRIP', 0, 4, 3],
    ]);
    const stride = INSTANCE_FLOATS * 4;
    const offsets = named(calls, 'vertexAttribPointer').map((call) => call[6]);
    expect(offsets).toEqual([
      0,
      12,
      28,
      2 * stride,
      2 * stride + 12,
      2 * stride + 28,
    ]);
  });

  it('only clears when nothing is visible', () => {
    const { renderer, calls } = setup();
    renderer.draw({ atlas: atlas(), batches: [batch('normal', 0)] });
    expect(calls).toEqual([['clear', 'COLOR_BUFFER_BIT']]);
  });

  it('reports a lost context once, then draws nothing', () => {
    let lost = 0;
    const { canvas, renderer, calls } = setup(() => {
      lost += 1;
    });
    canvas.dispatchEvent(new Event('webglcontextlost'));
    expect(lost).toBe(1);
    renderer.draw({ atlas: atlas(), batches: [batch('normal')] });
    renderer.clear();
    expect(calls).toEqual([]);
  });

  it('frees its resources and the context on dispose', () => {
    let lost = 0;
    const { canvas, renderer, calls } = setup(() => {
      lost += 1;
    });
    renderer.dispose();
    expect(calls.map(([name]) => name)).toEqual([
      'deleteBuffer',
      'deleteTexture',
      'deleteVertexArray',
      'deleteProgram',
      'loseContext',
    ]);
    expect([canvas.width, canvas.height]).toEqual([0, 0]);
    // Losing the context on purpose isn't reported.
    canvas.dispatchEvent(new Event('webglcontextlost'));
    expect(lost).toBe(0);
  });
});
