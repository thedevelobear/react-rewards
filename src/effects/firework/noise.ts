/** murmur3's finaliser: every input bit flips about half the output bits. */
const mix = (seed: number, n: number): number => {
  let h = Math.imul(seed | 0, 0x27d4eb2d) ^ Math.imul(n | 0, 0x9e3779b1);
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
};

/**
 * A number in [0, 1) that depends only on `seed` and `n`. Stars, trails and
 * sparks draw their randomness from it rather than from the burst's
 * generator, because how often a burst's generator has been drawn from by a
 * given moment depends on how many steps it took to get there. Keyed by a
 * particle's seed, a seeded burst is the same at any frame rate.
 */
export const noise = (seed: number, n: number): number =>
  mix(seed, n) / 2 ** 32;

/**
 * A child's seed, from its parent's seed and its number. It fits in 24 bits,
 * so a particle's slot stores it exactly.
 */
export const seedOf = (seed: number, n: number): number => mix(seed, n) >>> 8;
