/** `value` limited to the range from `min` to `max`. */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** The value `t` of the way from `from` to `to`. `t` isn't clamped. */
export const lerp = (from: number, to: number, t: number): number =>
  from + (to - from) * t;

/** Degrees to radians, the unit of `Particle.rotation`. */
export const degToRad = (degrees: number): number => degrees * (Math.PI / 180);

/**
 * Exponential decay by `rate` per second: after 1 s, `value` is multiplied by
 * e^-rate, however the second is split into steps. Use it for drag and fades.
 */
export const damp = (value: number, rate: number, dt: number): number =>
  value * Math.exp(-rate * dt);

/**
 * A velocity after `dt` seconds of constant `acceleration` (such as gravity)
 * and linear `drag` (per second, as in `damp`). It is exact, so the result
 * is the same at any frame rate. Applying the acceleration and the drag as
 * two separate steps instead drifts by a few pixels per second at 30 Hz.
 */
export const accelerate = (
  velocity: number,
  acceleration: number,
  drag: number,
  dt: number
): number => {
  if (drag === 0) return velocity + acceleration * dt;
  const terminal = acceleration / drag;
  return terminal + (velocity - terminal) * Math.exp(-drag * dt);
};
