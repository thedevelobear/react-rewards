import type { Region } from '@/core/atlas';
import type { Field, Pool } from '@/core/pool';

/** Two atlas regions at a pixel ratio of 2: 8 × 5 and 20 × 20 CSS pixels. */
export const regions: readonly Region[] = [
  { sx: 2, sy: 2, sw: 16, sh: 10, width: 8, height: 5 },
  { sx: 20, sy: 2, sw: 40, sh: 40, width: 20, height: 20 },
];

/** Adds a particle to `pool`, with `fields` set over the defaults. */
export const particle = (
  pool: Pool,
  fields: Partial<Record<Field, number>>
): void => {
  const index = pool.alloc();
  for (const [field, value] of Object.entries(fields)) {
    const array = pool.fields[field as Field];
    array[index] = value ?? 0;
  }
};
