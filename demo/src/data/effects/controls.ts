import type { Control } from './types';

/*
 * Controls that read the same for every effect. The descriptions are the
 * JSDoc in each effect's `types.ts` (ADR 0054).
 */

export const angle: Control<number> = {
  kind: 'range',
  min: 0,
  max: 360,
  step: 1,
  unit: '°',
  description:
    'The launch direction in degrees, counter-clockwise from the right. 90 is up.',
};

export const spread: Control<number> = {
  kind: 'range',
  min: 0,
  max: 360,
  step: 1,
  unit: '°',
  description: 'The width of the launch cone around `angle`, in degrees.',
};
