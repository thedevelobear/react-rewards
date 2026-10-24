import { defineEffect, type Effect } from '@/core/define-effect';
import { accelerate, clamp, degToRad, easeInOutQuad } from '@/core/math';
import type { ConfettiConfig } from './types';

/** A piece's height as a share of its width. */
const ASPECT = 0.625;
/** The radius of the circle a piece flutters around, per pixel of `size`. */
const FLUTTER_RADIUS = 1.25;
/** The last share of its life over which a piece fades out. */
const FADE = 0.2;
/** How fast a piece spins in the plane, per radian per second of flutter. */
const SPIN = 0.5;
/** The slowest and fastest flutter, in radians per second. */
const FLUTTER_MIN = 3;
const FLUTTER_MAX = 6;
/**
 * The most a piece glides sideways, as a share of `gravity`. At the defaults
 * the fastest pieces drift 180 px/s to the side while falling at 300 px/s.
 */
const GLIDE = 0.6;
/**
 * The glide eases in as a piece's fall speed goes from the first to the
 * second share of `gravity / drag`. With a drag of 3, that is from about half
 * a second to a second after the top of its flight.
 */
const GLIDE_FROM = 0.75;
const GLIDE_TO = 0.95;

/**
 * How much of its glide a piece has, from 0 to 1, by how close `vy` is to
 * the speed it settles at. It is 0 while the piece rises. Without drag or
 * gravity a piece never settles, so it never glides.
 */
const glideShare = (vy: number, { gravity, drag }: ConfettiConfig) => {
  if (gravity === 0 || drag <= 0) return 0;
  const settled = (vy * drag) / gravity;
  return easeInOutQuad(
    clamp((settled - GLIDE_FROM) / (GLIDE_TO - GLIDE_FROM), 0, 1)
  );
};

/**
 * Paper confetti (ADRs 0026, 0059). Pieces launch in a cone, slow down and
 * fall, flip about their horizontal axis, and flutter around a small circle.
 * Once it has been falling for a while, each glides sideways, away from the
 * cone's centre line, so the burst opens instead of falling in a column.
 *
 * Slots: `s0` is the flutter phase and `s1` its speed in radians per second.
 * The sign of `s1` is also the side the piece glides to (negative is left),
 * and its size how fast. `s2` is the flip phase and `s3` its speed.
 */
export const confetti: Effect<ConfettiConfig> =
  /* @__PURE__ */ defineEffect<ConfettiConfig>({
    name: 'confetti',
    blend: 'normal',
    defaults: {
      count: 50,
      size: 10,
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
      const offset = rng.range(-0.5, 0.5) * config.spread;
      const direction = degToRad(config.angle + offset);
      const speed = config.velocity * rng.range(0.5, 1.5);
      p.rotation = rng.range(0, Math.PI * 2);
      p.sprite = rng.int(0, config.colors.length);
      // Pieces end at slightly different times, and all by `lifetime`.
      p.life *= rng.range(0.85, 1);
      p.s0 = rng.range(0, Math.PI * 2);
      // A piece glides to the side of the cone it launched on. Up the
      // middle, or in a sideways cone, it picks a side at random.
      const right =
        0.5 - 0.5 * Math.sin(degToRad(config.angle)) * Math.sign(offset);
      p.s1 =
        rng.range(FLUTTER_MIN, FLUTTER_MAX) * (rng.next() < right ? 1 : -1);
      p.s2 = rng.range(0, Math.PI * 2);
      p.s3 = rng.range(5, 9);
      // The velocity includes the flutter from the start, as `update` expects.
      const flutter = config.size * FLUTTER_RADIUS * p.s1;
      p.vx = Math.cos(direction) * speed - flutter * Math.sin(p.s0);
      p.vy = -Math.sin(direction) * speed + flutter * Math.cos(p.s0);
    },
    update: (p, dt, config) => {
      // Take the flutter out, so drag, gravity and the glide act on the
      // flight alone, then add it back at the new phase.
      const flutter = config.size * FLUTTER_RADIUS * p.s1;
      const vx = p.vx + flutter * Math.sin(p.s0);
      const vy = p.vy - flutter * Math.cos(p.s0);
      p.s0 += p.s1 * dt;
      const fallen = accelerate(vy, config.gravity, config.drag, dt);
      // The glide uses the step's mean fall speed, so it matches at any
      // frame rate.
      const glide =
        Math.sign(p.s1) *
        ((Math.abs(p.s1) - FLUTTER_MIN) / (FLUTTER_MAX - FLUTTER_MIN)) *
        GLIDE *
        Math.abs(config.gravity) *
        glideShare((vy + fallen) / 2, config);
      p.vx = accelerate(vx, glide, config.drag, dt) - flutter * Math.sin(p.s0);
      p.vy = fallen + flutter * Math.cos(p.s0);

      p.s2 += p.s3 * dt;
      p.scaleY = Math.cos(p.s2);
      p.rotation += p.s1 * SPIN * dt;
      p.alpha = clamp((p.life - p.age) / (p.life * FADE), 0, 1);
    },
  });
