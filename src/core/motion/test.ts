import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { prefersReducedMotion } from '@/core/motion';

afterEach(() => {
  rs.unstubAllGlobals();
});

describe('prefersReducedMotion', () => {
  it('is false without matchMedia, as during server rendering', () => {
    expect(typeof matchMedia).toBe('undefined');
    expect(prefersReducedMotion()).toBe(false);
  });

  it('follows the prefers-reduced-motion media query', () => {
    const queries: string[] = [];
    let matches = true;
    rs.stubGlobal('matchMedia', (query: string) => {
      queries.push(query);
      return { matches };
    });
    expect(prefersReducedMotion()).toBe(true);
    matches = false;
    expect(prefersReducedMotion()).toBe(false);
    expect(queries).toEqual([
      '(prefers-reduced-motion: reduce)',
      '(prefers-reduced-motion: reduce)',
    ]);
  });
});
