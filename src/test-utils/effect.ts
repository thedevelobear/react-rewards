import {
  defineEffect,
  type Effect,
  type EffectConfig,
  type EffectDefinition,
} from '@/core/define-effect';

/**
 * An effect that does nothing unless `overrides` say so: two particles that
 * live 100 ms, drawn additively from a rect sprite and a circle sprite.
 */
export const testEffect = (
  overrides: Partial<EffectDefinition<EffectConfig>> = {}
): Effect =>
  defineEffect<EffectConfig>({
    name: 'test',
    blend: 'additive',
    defaults: { count: 2, lifetime: 100 },
    sprites: () => [
      { shape: 'rect', color: '#f00', width: 4, height: 4 },
      { shape: 'circle', color: '#00f', size: 4 },
    ],
    spawn: () => {},
    update: () => {},
    ...overrides,
  });
