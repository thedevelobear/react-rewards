import { describe, expect, it } from '@rstest/core';
import { defineEffect, resolveConfig } from '@/core/define-effect';

const sparkle = defineEffect({
  name: 'sparkle',
  blend: 'additive',
  defaults: { count: 20, lifetime: 1000, colors: ['#fff', '#ff0'], speed: 100 },
  sprites: (config) =>
    config.colors.map((color) => ({ shape: 'circle' as const, color })),
  spawn: (p, config, rng) => {
    p.vx = rng.range(-config.speed, config.speed);
    p.sprite = rng.int(0, config.colors.length);
  },
  update: (p, dt) => {
    p.alpha = Math.max(0, 1 - p.age / p.life);
    p.rotation += dt;
  },
});

describe('defineEffect', () => {
  it('returns the definition with every field', () => {
    expect(sparkle.name).toBe('sparkle');
    expect(sparkle.blend).toBe('additive');
    expect(sparkle.defaults).toEqual({
      count: 20,
      lifetime: 1000,
      colors: ['#fff', '#ff0'],
      speed: 100,
    });
    expect(sparkle.sprites(resolveConfig(sparkle))).toEqual([
      { shape: 'circle', color: '#fff' },
      { shape: 'circle', color: '#ff0' },
    ]);
  });

  it('freezes the effect and its defaults', () => {
    expect(Object.isFrozen(sparkle)).toBe(true);
    expect(Object.isFrozen(sparkle.defaults)).toBe(true);
  });

  it('copies the defaults, so the caller cannot change them later', () => {
    const defaults = { count: 1, lifetime: 100 };
    const effect = defineEffect({
      name: 'copy',
      blend: 'normal',
      defaults,
      sprites: () => [{ emoji: '🎉' }],
      spawn: () => {},
      update: () => {},
    });
    defaults.count = 99;
    expect(effect.defaults.count).toBe(1);
  });
});

describe('resolveConfig', () => {
  it('returns a copy of the defaults when there are no overrides', () => {
    const config = resolveConfig(sparkle);
    expect(config).toEqual(sparkle.defaults);
    expect(config).not.toBe(sparkle.defaults);
  });

  it('applies overrides and replaces arrays whole', () => {
    expect(resolveConfig(sparkle, { count: 5, colors: ['#000'] })).toEqual({
      count: 5,
      lifetime: 1000,
      colors: ['#000'],
      speed: 100,
    });
  });

  it('keeps the default for overrides set to undefined', () => {
    expect(resolveConfig(sparkle, { count: undefined }).count).toBe(20);
  });
});
