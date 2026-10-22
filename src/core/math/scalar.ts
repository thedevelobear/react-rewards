export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const lerp = (from: number, to: number, t: number): number =>
  from + (to - from) * t;

export const degToRad = (degrees: number): number => degrees * (Math.PI / 180);

/**
 * Exponential decay by `rate` per second: after 1 s, `value` is multiplied by
 * e^-rate, however the second is split into steps. Use it for drag and fades.
 */
export const damp = (value: number, rate: number, dt: number): number =>
  value * Math.exp(-rate * dt);
