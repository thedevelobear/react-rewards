import { defineEffect, type Effect } from '@/core/define-effect';
import { accelerate, clamp, damp, degToRad } from '@/core/math';
import svg from './balloon.svg?raw';
import type { BalloonConfig } from './types';

/** A balloon's height as a share of its width, string included. */
const ASPECT = 3040 / 976;
/** How far a balloon sways to either side, per pixel of `size`. */
const SWAY = 1;
/** The most a balloon tilts with its sway, in radians. */
const TILT = 0.2;
/** The last share of its life over which a balloon fades out. */
const FADE = 0.2;

/**
 * Balloons (ADR 0039). They launch in a cone, then a negative `gravity`
 * lifts them to a steady rise. Each sways side to side and tilts with the
 * sway, so its string trails behind.
 *
 * Slots: `s0` scales the balloon's gravity, so balloons rise at different
 * speeds. `s1` is the sway phase and `s2` its speed in radians per second.
 */
export const balloon: Effect<BalloonConfig> =
  /* @__PURE__ */ defineEffect<BalloonConfig>({
    name: 'balloon',
    blend: 'normal',
    defaults: {
      count: 16,
      size: 30,
      colors: ['#A45BF1', '#25C6F6', '#72F753', '#F76C88', '#F5F770'],
      angle: 90,
      spread: 90,
      velocity: 300,
      drag: 2,
      gravity: -300,
      lifetime: 5000,
    },
    // Colour is baked into each sprite, because particles have no tint.
    sprites: ({ size, colors }) =>
      colors.map((color) => ({
        svg: svg.replaceAll('currentColor', color),
        width: size,
        height: size * ASPECT,
      })),
    spawn: (p, config, rng) => {
      const direction = degToRad(
        config.angle + rng.range(-0.5, 0.5) * config.spread
      );
      const speed = config.velocity * rng.range(0.5, 1.5);
      p.sprite = rng.int(0, config.colors.length);
      // Balloons end at slightly different times, and all by `lifetime`.
      p.life *= rng.range(0.85, 1);
      p.scale = rng.range(0.9, 1.1);
      p.s0 = rng.range(0.8, 1.2);
      p.s1 = rng.range(0, Math.PI * 2);
      p.s2 = rng.range(1, 2);
      // The velocity includes the sway from the start, as `update` expects.
      const sway = config.size * SWAY * p.s2;
      p.vx = Math.cos(direction) * speed + sway * Math.cos(p.s1);
      p.vy = -Math.sin(direction) * speed;
      p.rotation = TILT * Math.cos(p.s1);
    },
    update: (p, dt, config) => {
      // Take the sway out, so drag acts on the flight alone, then add it back
      // at the new phase.
      const sway = config.size * SWAY * p.s2;
      const vx = p.vx - sway * Math.cos(p.s1);
      p.s1 += p.s2 * dt;
      p.vx = damp(vx, config.drag, dt) + sway * Math.cos(p.s1);
      p.vy = accelerate(p.vy, config.gravity * p.s0, config.drag, dt);
      // Leaning into the sway, so the string trails behind.
      p.rotation = TILT * Math.cos(p.s1);
      p.alpha = clamp((p.life - p.age) / (p.life * FADE), 0, 1);
    },
  });
