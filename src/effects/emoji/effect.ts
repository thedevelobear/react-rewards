import { defineEffect, type Effect } from '@/core/define-effect';
import { accelerate, clamp, damp, degToRad, easeOutCubic } from '@/core/math';
import type { EmojiConfig } from './types';

/** Seconds an emoji takes to grow from nothing to its full scale. */
const POP = 0.15;
/** The last share of its life over which an emoji fades out. */
const FADE = 0.2;
/** The most an emoji starts tilted from upright, in radians. */
const TILT = degToRad(15);

/**
 * Emoji (ADR 0038). They fly like confetti, launching in a cone, slowing
 * down and falling, and pop in as they launch. With `rotate`, they start a
 * little tilted and spin gently.
 *
 * Slots: `s0` is the emoji's full scale and `s1` its spin in radians per
 * second (negative turns the other way).
 */
export const emoji: Effect<EmojiConfig> = defineEffect<EmojiConfig>({
  name: 'emoji',
  blend: 'normal',
  defaults: {
    count: 20,
    size: 25,
    emojis: ['🤓', '😊', '🥳'],
    angle: 90,
    spread: 45,
    velocity: 1500,
    drag: 3,
    gravity: 900,
    lifetime: 3000,
    rotate: true,
  },
  sprites: ({ size, emojis }) =>
    emojis.map((glyph) => ({ emoji: glyph, size })),
  spawn: (p, config, rng, index) => {
    const direction = degToRad(
      config.angle + rng.range(-0.5, 0.5) * config.spread
    );
    const speed = config.velocity * rng.range(0.5, 1.5);
    p.vx = Math.cos(direction) * speed;
    p.vy = -Math.sin(direction) * speed;
    // In turn, so every emoji shows up even in a small burst.
    p.sprite = index % config.emojis.length;
    // Emoji end at slightly different times, and all by `lifetime`.
    p.life *= rng.range(0.85, 1);
    p.s0 = rng.range(0.9, 1.1);
    p.scale = 0;
    // Drawn either way, so `rotate` doesn't change the flight of a seeded
    // burst.
    const tilt = rng.range(-TILT, TILT);
    const spin = rng.range(0.5, 2) * (rng.next() < 0.5 ? -1 : 1);
    if (config.rotate) {
      p.rotation = tilt;
      p.s1 = spin;
    }
  },
  update: (p, dt, config) => {
    p.vx = damp(p.vx, config.drag, dt);
    p.vy = accelerate(p.vy, config.gravity, config.drag, dt);
    p.rotation += p.s1 * dt;
    p.scale = p.s0 * easeOutCubic(clamp(p.age / POP, 0, 1));
    p.alpha = clamp((p.life - p.age) / (p.life * FADE), 0, 1);
  },
});
