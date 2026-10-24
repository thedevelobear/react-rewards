import type { Rng } from './types';

const randomSeed = (): number => Math.floor(Math.random() * 2 ** 32);

/**
 * mulberry32: 32 bits of state, fast, and good enough for visuals. The same
 * seed always gives the same sequence, which keeps tests deterministic.
 */
export const createRng = (seed: number = randomSeed()): Rng => {
  let state = seed | 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };

  return {
    seed,
    next,
    range: (min, max) => min + next() * (max - min),
    int: (min, max) => min + Math.floor(next() * (max - min)),
    pick: <T>(items: readonly T[]): T => {
      if (items.length === 0) {
        throw new RangeError('pick() needs at least one item.');
      }
      return items[Math.floor(next() * items.length)] as T;
    },
  };
};
