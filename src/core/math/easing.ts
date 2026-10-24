import type { Easing } from './types';

export const linear: Easing = (t) => t;

export const easeInQuad: Easing = (t) => t * t;

export const easeOutQuad: Easing = (t) => t * (2 - t);

export const easeInOutQuad: Easing = (t) =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

export const easeInCubic: Easing = (t) => t * t * t;

export const easeOutCubic: Easing = (t) => 1 - (1 - t) ** 3;

export const easeInOutCubic: Easing = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
