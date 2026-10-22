import { describe, expect, it } from '@rstest/core';
import { type Measurable, resolveOrigin } from '@/core/origin';

const box = (left: number, top: number, width: number, height: number) =>
  ({
    getBoundingClientRect: () => ({ left, top, width, height }),
  }) satisfies Measurable;

describe('resolveOrigin', () => {
  it('uses a point as given, as a copy', () => {
    const point = { x: 12, y: 34 };
    const resolved = resolveOrigin(point);
    expect(resolved).toEqual({ x: 12, y: 34 });
    expect(resolved).not.toBe(point);
  });

  it("uses an element's centre", () => {
    expect(resolveOrigin(box(100, 50, 40, 20))).toEqual({ x: 120, y: 60 });
  });

  it("uses a ref's element, measured when called", () => {
    const ref: { current: Measurable | null } = { current: box(0, 0, 10, 10) };
    expect(resolveOrigin(ref)).toEqual({ x: 5, y: 5 });
    ref.current = box(200, 0, 10, 10);
    expect(resolveOrigin(ref)).toEqual({ x: 205, y: 5 });
  });

  it('gives undefined for an empty ref', () => {
    expect(resolveOrigin({ current: null })).toBeUndefined();
  });
});
