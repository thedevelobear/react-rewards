import { describe, expect, it } from '@rstest/core';
import {
  accelerate,
  clamp,
  createRng,
  damp,
  degToRad,
  easeInCubic,
  easeInOutCubic,
  easeInOutQuad,
  easeInQuad,
  easeOutCubic,
  easeOutQuad,
  lerp,
  linear,
} from '@/core/math';

const draw = (count: number, fn: () => number): number[] =>
  Array.from({ length: count }, fn);

describe('createRng', () => {
  it('matches the reference mulberry32 sequence', () => {
    const rng = createRng(1);
    expect(draw(3, rng.next)).toEqual([
      0.6270739405881613, 0.002735721180215478, 0.5274470399599522,
    ]);
  });

  it('repeats the same sequence for the same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect(draw(100, a.next)).toEqual(draw(100, b.next));
    expect(a.seed).toBe(42);
  });

  it('gives different sequences for different seeds', () => {
    expect(draw(10, createRng(1).next)).not.toEqual(
      draw(10, createRng(2).next)
    );
  });

  it('picks a random seed when none is given', () => {
    const rng = createRng();
    expect(Number.isInteger(rng.seed)).toBe(true);
    expect(rng.next()).toBeGreaterThanOrEqual(0);
  });

  it('keeps next() in [0, 1) with a mean near 0.5', () => {
    const values = draw(10_000, createRng(7).next);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    expect(mean).toBeCloseTo(0.5, 1);
  });

  it('keeps range() and int() inside their bounds', () => {
    const rng = createRng(3);
    const floats = draw(1000, () => rng.range(-5, 5));
    expect(floats.every((v) => v >= -5 && v < 5)).toBe(true);

    const ints = draw(1000, () => rng.int(2, 6));
    expect(ints.every(Number.isInteger)).toBe(true);
    expect([...new Set(ints)].sort()).toEqual([2, 3, 4, 5]);
  });

  it('picks every item eventually, and throws on an empty list', () => {
    const rng = createRng(5);
    const items = ['a', 'b', 'c'] as const;
    const picked = new Set(draw(100, () => rng.pick(items).charCodeAt(0)));
    expect(picked.size).toBe(3);
    expect(() => rng.pick([])).toThrow(RangeError);
  });
});

describe('easing', () => {
  const easings = {
    linear,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
    easeInCubic,
    easeOutCubic,
    easeInOutCubic,
  };

  for (const [name, ease] of Object.entries(easings)) {
    it(`${name} runs from 0 to 1 without going back`, () => {
      expect(ease(0)).toBeCloseTo(0, 10);
      expect(ease(1)).toBeCloseTo(1, 10);
      const samples = Array.from({ length: 101 }, (_, i) => ease(i / 100));
      for (let i = 1; i < samples.length; i++) {
        expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1] ?? 0);
      }
    });
  }

  it('is symmetric for the in-out curves', () => {
    expect(easeInOutQuad(0.5)).toBeCloseTo(0.5, 10);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 10);
  });
});

describe('scalar helpers', () => {
  it('clamps, interpolates and converts degrees', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(lerp(10, 20, 0.25)).toBe(12.5);
    expect(degToRad(180)).toBeCloseTo(Math.PI, 10);
  });

  it('damps by the same amount however a second is split', () => {
    const run = (steps: number): number => {
      let value = 100;
      for (let i = 0; i < steps; i++) value = damp(value, 2, 1 / steps);
      return value;
    };
    const expected = 100 * Math.exp(-2);
    expect(run(30)).toBeCloseTo(expected, 9);
    expect(run(60)).toBeCloseTo(expected, 9);
    expect(run(144)).toBeCloseTo(expected, 9);
  });

  it('accelerates under drag by the same amount however a second is split', () => {
    const run = (steps: number): number => {
      let velocity = -700;
      for (let i = 0; i < steps; i++) {
        velocity = accelerate(velocity, 900, 1.5, 1 / steps);
      }
      return velocity;
    };
    const expected = 600 + (-700 - 600) * Math.exp(-1.5);
    expect(run(30)).toBeCloseTo(expected, 9);
    expect(run(144)).toBeCloseTo(expected, 9);
  });

  it('accelerates linearly without drag', () => {
    expect(accelerate(10, 900, 0, 0.5)).toBe(460);
  });
});
