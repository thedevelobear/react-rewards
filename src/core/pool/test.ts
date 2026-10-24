import { describe, expect, it } from '@rstest/core';
import { createPool, FIELDS, type Pool } from '@/core/pool';

const snapshot = (pool: Pool, index: number): Record<string, number> =>
  Object.fromEntries(
    FIELDS.map((field) => [field, pool.fields[field][index] ?? Number.NaN])
  );

describe('createPool', () => {
  it('starts empty, with one array per field', () => {
    const pool = createPool(8);
    expect(pool.count).toBe(0);
    expect(pool.capacity).toBe(8);
    for (const field of FIELDS) {
      expect(pool.fields[field]).toBeInstanceOf(Float32Array);
      expect(pool.fields[field].length).toBe(8);
    }
  });

  it('adds particles at the end with default fields', () => {
    const pool = createPool(4);
    expect(pool.alloc()).toBe(0);
    expect(pool.alloc()).toBe(1);
    expect(pool.count).toBe(2);
    expect(snapshot(pool, 1)).toEqual({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rotation: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      sprite: 0,
      age: 0,
      life: 0,
      s0: 0,
      s1: 0,
      s2: 0,
      s3: 0,
    });
  });

  it('resets a reused slot to the defaults', () => {
    const pool = createPool(2);
    const index = pool.alloc();
    pool.fields.x[index] = 50;
    pool.fields.alpha[index] = 0.25;
    pool.free(index);
    expect(pool.alloc()).toBe(index);
    expect(pool.fields.x[index]).toBe(0);
    expect(pool.fields.alpha[index]).toBe(1);
  });

  it('doubles when full and keeps the data', () => {
    const pool = createPool(2);
    for (let i = 0; i < 3; i++) {
      const index = pool.alloc();
      pool.fields.x[index] = i + 1;
    }
    expect(pool.capacity).toBe(4);
    expect(pool.count).toBe(3);
    expect(Array.from(pool.fields.x.subarray(0, 3))).toEqual([1, 2, 3]);
    expect(pool.fields.s3.length).toBe(4);
  });

  it('replaces the arrays when it grows, so old references go stale', () => {
    const pool = createPool(1);
    pool.alloc();
    const before = pool.fields.x;
    pool.alloc();
    expect(pool.fields.x).not.toBe(before);
    // `pool.fields.x[pool.alloc()] = v` reads the array before alloc() grows
    // it, so the write is lost. Call alloc() first.
    const stale = pool.fields.x;
    stale[pool.alloc()] = 7;
    expect(pool.fields.x[2]).toBe(0);
  });

  it('treats a capacity below 1 as 1', () => {
    const pool = createPool(0);
    expect(pool.capacity).toBe(1);
    pool.alloc();
    pool.alloc();
    expect(pool.capacity).toBe(2);
  });

  it('removes by moving the last particle into the gap', () => {
    const pool = createPool(4);
    for (let i = 0; i < 4; i++) {
      const index = pool.alloc();
      pool.fields.x[index] = (i + 1) * 10;
    }
    pool.free(1);
    expect(pool.count).toBe(3);
    expect(Array.from(pool.fields.x.subarray(0, 3))).toEqual([10, 40, 30]);
    pool.free(2);
    expect(Array.from(pool.fields.x.subarray(0, 2))).toEqual([10, 40]);
  });

  it('rejects indices that hold no live particle', () => {
    const pool = createPool(4);
    pool.alloc();
    expect(() => pool.free(1)).toThrow(RangeError);
    expect(() => pool.free(-1)).toThrow(RangeError);
    expect(() => pool.free(0.5)).toThrow(RangeError);
  });

  it('clears every particle', () => {
    const pool = createPool(4);
    pool.alloc();
    pool.alloc();
    pool.clear();
    expect(pool.count).toBe(0);
    expect(pool.alloc()).toBe(0);
  });
});
