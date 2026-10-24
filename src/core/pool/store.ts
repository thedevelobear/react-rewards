import type { Field, Pool } from './types';

/** The per-particle fields. The pool keeps one `Float32Array` for each. */
export const FIELDS = [
  'x',
  'y',
  'vx',
  'vy',
  'rotation',
  'scale',
  'scaleX',
  'scaleY',
  'alpha',
  'sprite',
  'age',
  'life',
  's0',
  's1',
  's2',
  's3',
] as const;

/** The value each field starts at when a particle is added. */
const DEFAULTS: Readonly<Record<Field, number>> = {
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
};

const allocateFields = (capacity: number): Record<Field, Float32Array> =>
  Object.fromEntries(
    FIELDS.map((field) => [field, new Float32Array(capacity)])
  ) as Record<Field, Float32Array>;

/** Creates a pool. It doubles its capacity whenever it is full. */
export const createPool = (initialCapacity = 64): Pool => {
  let capacity = Math.max(1, Math.floor(initialCapacity));
  let count = 0;
  const fields = allocateFields(capacity);

  const grow = (): void => {
    capacity *= 2;
    for (const field of FIELDS) {
      const next = new Float32Array(capacity);
      next.set(fields[field]);
      fields[field] = next;
    }
  };

  return {
    get count() {
      return count;
    },
    get capacity() {
      return capacity;
    },
    fields,
    alloc: () => {
      if (count === capacity) grow();
      const index = count;
      count += 1;
      for (const field of FIELDS) {
        fields[field][index] = DEFAULTS[field];
      }
      return index;
    },
    free: (index) => {
      if (!Number.isInteger(index) || index < 0 || index >= count) {
        throw new RangeError(`No live particle at index ${index}.`);
      }
      const last = count - 1;
      if (index !== last) {
        for (const field of FIELDS) {
          const values = fields[field];
          values[index] = values[last] ?? 0;
        }
      }
      count = last;
    },
    clear: () => {
      count = 0;
    },
  };
};
