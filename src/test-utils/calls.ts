import type { Call } from './types';

/** The recorded calls to `name`, in order. */
export const named = (calls: readonly Call[], name: string): Call[] =>
  calls.filter(([call]) => call === name);
