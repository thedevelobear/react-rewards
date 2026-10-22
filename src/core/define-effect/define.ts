import type { Effect, EffectConfig, EffectDefinition } from './types';

/**
 * Declares an effect. The config type is inferred from `defaults`, so
 * `spawn`, `update` and `sprites` get it typed. The result and its defaults
 * are frozen, so one caller can't change an effect for everyone.
 */
export const defineEffect = <C extends EffectConfig>(
  definition: EffectDefinition<C>
): Effect<C> =>
  Object.freeze({
    ...definition,
    defaults: Object.freeze({ ...definition.defaults }),
  });

/**
 * The effect's defaults with `overrides` applied. Keys set to `undefined`
 * keep their default, so optional props can be passed straight through.
 */
export const resolveConfig = <C extends EffectConfig>(
  effect: Effect<C>,
  overrides: Partial<C> = {}
): C => {
  const config = { ...effect.defaults } as C;
  for (const key of Object.keys(overrides) as (keyof C)[]) {
    const value = overrides[key];
    if (value !== undefined) config[key] = value as C[keyof C];
  }
  return config;
};
