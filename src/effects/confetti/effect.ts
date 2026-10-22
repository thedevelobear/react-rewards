import { defineEffect, type Effect } from '@/core/define-effect';
import { accelerate, clamp, damp, degToRad } from '@/core/math';
import type { ConfettiConfig } from './types';

/** A piece's height as a share of its width. */
const ASPECT = 0.625;
/** The radius of the circle a piece flutters around, per pixel of `size`. */
const FLUTTER_RADIUS = 1.25;
/** The last share of its life over which a piece fades out. */
const FADE = 0.2;
/** How fast a piece spins in the plane, per radian per second of flutter. */
const SPIN = 0.5;

/**
 * Paper confetti (ADR 0026). Pieces launch in a cone, slow down and fall,
 * flip about their horizontal axis, and flutter around a small circle.
 *
 * Slots: `s0` is the flutter phase and `s1` its speed in radians per second
 * (negative turns the other way). `s2` is the flip phase and `s3` its speed.
 */
export const confetti: Effect<ConfettiConfig> = defineEffect<ConfettiConfig>({
  name: 'confetti',
  blend: 'normal',
  defaults: {
    count: 50,
    size: 8,
    colors: ['#A45BF1', '#25C6F6', '#72F753', '#F76C88', '#F5F770'],
    angle: 90,
    spread: 45,
    velocity: 1500,
    drag: 3,
    gravity: 900,
    lifetime: 3000,
  },
  sprites: ({ size, colors }) =>
    colors.map((color) => ({
      shape: 'rect',
      color,
      width: size,
      height: size * ASPECT,
    })),
  spawn: (p, config, rng) => {
    const direction = degToRad(
      config.angle + rng.range(-0.5, 0.5) * config.spread
    );
    const speed = config.velocity * rng.range(0.5, 1.5);
    p.rotation = rng.range(0, Math.PI * 2);
    p.sprite = rng.int(0, config.colors.length);
    // Pieces end at slightly different times, and all by `lifetime`.
    p.life *= rng.range(0.85, 1);
    p.s0 = rng.range(0, Math.PI * 2);
    p.s1 = rng.range(3, 6) * (rng.next() < 0.5 ? -1 : 1);
    p.s2 = rng.range(0, Math.PI * 2);
    p.s3 = rng.range(5, 9);
    // The velocity includes the flutter from the start, as `update` expects.
    const flutter = config.size * FLUTTER_RADIUS * p.s1;
    p.vx = Math.cos(direction) * speed - flutter * Math.sin(p.s0);
    p.vy = -Math.sin(direction) * speed + flutter * Math.cos(p.s0);
  },
  update: (p, dt, config) => {
    // Take the flutter out, so drag and gravity act on the flight alone,
    // then add it back at the new phase.
    const flutter = config.size * FLUTTER_RADIUS * p.s1;
    const vx = p.vx + flutter * Math.sin(p.s0);
    const vy = p.vy - flutter * Math.cos(p.s0);
    p.s0 += p.s1 * dt;
    p.vx = damp(vx, config.drag, dt) - flutter * Math.sin(p.s0);
    p.vy =
      accelerate(vy, config.gravity, config.drag, dt) +
      flutter * Math.cos(p.s0);

    p.s2 += p.s3 * dt;
    p.scaleY = Math.cos(p.s2);
    p.rotation += p.s1 * SPIN * dt;
    p.alpha = clamp((p.life - p.age) / (p.life * FADE), 0, 1);
  },
});
