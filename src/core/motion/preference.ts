const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Whether the user asked their system for reduced motion. False when it
 * can't be told, such as during server rendering.
 */
export const prefersReducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia(QUERY).matches;
