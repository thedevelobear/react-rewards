/**
 * A number in [0, 1) that depends only on `seed` and `n`, from murmur3's
 * finaliser, as in `firework`. A star and its streak read their reach, size
 * and twinkle from their seed, so each draws the same values on every step
 * without a slot for each.
 */
export const noise = (seed: number, n: number): number => {
  let h = Math.imul(seed | 0, 0x27d4eb2d) ^ Math.imul(n | 0, 0x9e3779b1);
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32;
};
