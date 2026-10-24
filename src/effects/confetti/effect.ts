import { defineEffect, type Effect } from '@/core/define-effect';
import { accelerate, clamp, degToRad, easeInOutCubic, lerp } from '@/core/math';
import type { ConfettiConfig } from './types';

/** A piece's height as a share of its width. */
const ASPECT = 0.625;
/** The last share of its life over which a piece fades out. */
const FADE = 0.2;
/** The slowest and fastest swing, in radians per second. */
const SWING_MIN = 4;
const SWING_MAX = 8;
/**
 * A settled piece's fastest swing across, as a share of its fall speed, for
 * a flutterer and a tumbler. At the defaults a flutterer swings about 11 px
 * to either side, and a tumbler 2 px.
 */
const SWAY_FLUTTER = 0.15;
const SWAY_TUMBLE = 0.06;
/**
 * How much the swing slows and speeds the fall, as a share of the fall
 * speed. A flutterer slows a little as it swings out, and dips back in.
 */
const ARC_FLUTTER = 0.15;
const ARC_TUMBLE = 0.06;
/** How far a flutterer rocks with its swing, in radians. */
const ROCK = 0.2;
/** How fast a piece spins in flight, per radian per second of swing. */
const SPIN = 0.5;
/** How fast a tumbler turns end over end, in radians per second. */
const TUMBLE = 3;
/** How many times a piece flips per swing. */
const FLIP = 1.4;
/** The most a tumbler glides sideways, as a share of its fall speed. */
const GLIDE = 0.3;
/** The slowest and fastest a piece falls, as shares of `gravity / drag`. */
const FALL_MIN = 0.8;
const FALL_MAX = 1.2;
/**
 * When a piece starts and ends settling into its fall, in seconds from the
 * top of its flight. It eases in over the whole time, so no moment shows
 * where it starts.
 */
const SETTLE_FROM = -0.4;
const SETTLE_TO = 1.6;

/**
 * How settled a piece is into its fall, from 0 to 1. A piece that falls from
 * rest reaches `vy` after `-ln(1 - vy / fall) / drag` seconds, and a rising
 * piece tops out that many seconds before 0, so `vy` says where the piece is
 * in its flight, exactly at any frame rate.
 */
const settled = (vy: number, gravity: number, fall: number, drag: number) => {
  if (fall === 0) return 0;
  const share = (vy * Math.sign(gravity)) / fall;
  const sinceTop = share < 1 ? -Math.log(1 - share) / drag : SETTLE_TO;
  return easeInOutCubic(
    clamp((sinceTop - SETTLE_FROM) / (SETTLE_TO - SETTLE_FROM), 0, 1)
  );
};

/** A piece's swing and fall, from its slots `s1` and `s3`. */
const motion = (s1: number, s3: number, config: ConfettiConfig) => {
  const speed = Math.abs(s1);
  // 0 for a flutterer, 1 for a tumbler.
  const tumbler = (speed - SWING_MIN) / (SWING_MAX - SWING_MIN);
  const gravity = config.gravity * s3;
  // The speed this piece settles at. Without drag it never settles.
  const fall = config.drag > 0 ? Math.abs(gravity) / config.drag : 0;
  return {
    speed,
    tumbler,
    gravity,
    fall,
    sway: fall * lerp(SWAY_FLUTTER, SWAY_TUMBLE, tumbler),
    arc: fall * lerp(ARC_FLUTTER, ARC_TUMBLE, tumbler),
  };
};

/**
 * Paper confetti (ADRs 0026, 0059). Pieces launch in a cone, slow down,
 * spin and flip. From just before the top of its flight, a piece eases into
 * falling the way paper does, somewhere between two ways: a flutterer sways gently from side to
 * side like a leaf, rocking with the sway, while a tumbler turns end over
 * end with a slight wobble and glides to one side. Each piece falls at its
 * own speed, so the burst opens a little as it falls instead of falling in a
 * column or as a block.
 *
 * Slots: `s0` is the swing phase and `s1` its speed in radians per second.
 * The size of `s1` places the piece between flutterer and tumbler, and its
 * sign is the side it tumbles and glides to (negative is left). `s2` is how
 * settled the piece is, from 0 to 1, as of the last step. `s3` scales its
 * gravity, so pieces fall at different speeds.
 */
export const confetti: Effect<ConfettiConfig> =
  /* @__PURE__ */ defineEffect<ConfettiConfig>({
    name: 'confetti',
    blend: 'normal',
    defaults: {
      count: 100,
      size: 10,
      colors: ['#A45BF1', '#25C6F6', '#72F753', '#F76C88', '#F5F770'],
      angle: 90,
      spread: 60,
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
      p.s1 = rng.range(SWING_MIN, SWING_MAX) * (rng.next() < 0.5 ? -1 : 1);
      p.s3 = rng.range(FALL_MIN, FALL_MAX);
      // A piece may have begun to settle by its launch, so its velocity
      // includes that much swing from the start, as `update` expects.
      const { gravity, fall, sway, arc } = motion(p.s1, p.s3, config);
      const vy = -Math.sin(direction) * speed;
      p.s2 = settled(vy, gravity, fall, config.drag);
      p.vx = Math.cos(direction) * speed + p.s2 * sway * Math.cos(p.s0);
      p.vy = vy - p.s2 * arc * Math.sin(2 * p.s0);
      p.scaleY = Math.cos(FLIP * p.s0);
    },
    update: (p, dt, config) => {
      const side = Math.sign(p.s1);
      const { speed, tumbler, gravity, fall, sway, arc } = motion(
        p.s1,
        p.s3,
        config
      );

      // Take the swing out, so drag, gravity and the glide act on the flight
      // alone, then add it back at the new phase. The swing moves the piece
      // along an arc, `sin` across and `sin²` up, so it slows as it swings
      // out and swoops back in.
      const before = p.s2;
      const phase = p.s0;
      const vx = p.vx - before * sway * Math.cos(phase);
      const vy = p.vy + before * arc * Math.sin(2 * phase);
      p.s0 = phase + speed * dt;

      const fallen = accelerate(vy, gravity, config.drag, dt);
      // The glide acts through the step, so it takes how settled the piece
      // is midway. The swing is the piece's state at the step's end, so it
      // takes how settled the piece is then, as the next step expects. Both
      // keep the effect the same at any frame rate.
      const midway = settled((vy + fallen) / 2, gravity, fall, config.drag);
      const after = settled(fallen, gravity, fall, config.drag);
      const glide = side * tumbler * GLIDE * Math.abs(gravity) * midway;
      p.vx =
        accelerate(vx, glide, config.drag, dt) + after * sway * Math.cos(p.s0);
      p.vy = fallen - after * arc * Math.sin(2 * p.s0);
      p.s2 = after;

      // In flight a piece spins. Settled, a flutterer rocks with its swing,
      // its leading edge rising at each end, and a tumbler turns end over
      // end.
      const spin =
        p.s1 * SPIN * (1 - midway) + side * tumbler * TUMBLE * midway;
      const rock = -ROCK * (1 - tumbler);
      p.rotation +=
        spin * dt + rock * (after * Math.sin(p.s0) - before * Math.sin(phase));
      p.scaleY = Math.cos(FLIP * p.s0);
      p.alpha = clamp((p.life - p.age) / (p.life * FADE), 0, 1);
    },
  });
