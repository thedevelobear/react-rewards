import {
  defineEffect,
  type Effect,
  type Particle,
  type UpdateContext,
} from '@/core/define-effect';
import {
  clamp,
  createRng,
  degToRad,
  easeInOutCubic,
  easeOutCubic,
  lerp,
} from '@/core/math';
import { noise } from './noise';
import { easeOutBack, placeAt, ringAt } from './path';
import { dot, flash, star, tail } from './sprites';
import type { Path, Place, PopConfig } from './types';

/* Roles, kept in slot `s0`. A streak's role is its star's plus `LONG_TAIL`. */
const LONG = 0;
const SHORT = 1;
const LONG_TAIL = 2;
const DOT = 4;
const FLASH = 5;

/*
 * What a star still has to add on its first step, kept in its `s3`: its
 * streak, and for the first star the flash and the ring as well.
 */
const DONE = 0;
const FRESH = 1;
const LEAD = 2;

/** Mixed into the burst's seed for the draws every star shares. */
const SHARED = 0x3c6ef372;
/** How far a streak strays from its share of the circle, as a share of the gap to the next. */
const JITTER = 0.12;
/** Where the streaks start, as a share of `radius`. */
const START = 0.2;
/** Where a short streak's star lands, as a share of `radius`. */
const SHORT_REACH = 0.62;
/** A short streak's star, as a share of a long one's size. */
const SHORT_SIZE = 0.7;
/**
 * How much a star's reach and size vary either way, as shares. One draw sets
 * both, so bigger stars fly further.
 */
const REACH_JITTER = 0.06;
const SIZE_JITTER = 0.1;
/**
 * A streak's air resistance, per lifetime rather than per second, so a pop
 * keeps its shape at any `lifetime`. At 800 ms it is 7.5 per second: a star
 * has covered 63% of its way 0.13 s after its launch and 95% after 0.4 s.
 */
const STREAK_DRAG = 6;
/** When the short streaks launch, as a share of lifetime. The long ones launch at once. */
const SHORT_DELAY = 0.06;
/** A star's size while it leads its streak, as a share of its full size. */
const TIP = 0.35;
/** When a star blooms to its full size, as shares of lifetime since its launch. */
const BLOOM_FROM = 0.25;
const BLOOM_TO = 0.5;
/** The fewest and most twinkles a star would make in a whole lifetime. */
const TWINKLE_MIN = 3;
const TWINKLE_MAX = 4.5;
/** How long a star's twinkle takes to set in, as a share of lifetime. */
const TWINKLE_RAMP = 0.12;
/** How much a twinkle shrinks and dims a star at its deepest. */
const TWINKLE_SHRINK = 0.4;
const TWINKLE_DIM = 0.25;
/** The share of lifetime over which a star shrinks to nothing at its end. */
const SHRINK = 0.25;
/** How much sooner than `lifetime` a star may end, as a share of it. */
const END_JITTER = 0.08;
/** How far a star turns on its own by the end, as a multiple of the swirl. */
const SPIN = 1.5;
/** How long a streak lives after its launch, and fades over at its end, as shares of lifetime. */
const TAIL_LIFE = 0.75;
const TAIL_FADE = 0.1;

/** The ring's air resistance per lifetime: 10 per second at 800 ms. */
const RING_DRAG = 8;
/** Where the ring starts and where it heads for, as shares of `radius`. */
const RING_FROM = 0.3;
const RING_TO = 1.15;
/** How long the ring lasts, as a share of lifetime. */
const RING_LIFE = 0.45;
/** How much a dot has shrunk once the ring is spent. */
const THIN = 0.55;
/** A dot's diameter, as a share of `size`. */
const DOT_SIZE = 0.32;

/** How long the flash lasts, as a share of lifetime. */
const FLASH_LIFE = 0.12;
/** The flash's diameter, as a share of `radius`. */
const FLASH_SIZE = 1.2;
/** The flash's size as it starts, as a share of its full size. */
const FLASH_FROM = 0.6;
/** The flash's opacity as it starts. */
const FLASH_ALPHA = 0.85;

/** The pop's length in seconds, at least a millisecond. */
const seconds = (config: PopConfig): number =>
  Math.max(config.lifetime, 1) / 1000;

/** A star's size as a share of `size`, from its kind and seed. */
const sizeOf = (kind: number, seed: number): number =>
  (kind === LONG ? 1 : SHORT_SIZE) *
  (1 + SIZE_JITTER * (2 * noise(seed, 0) - 1));

/** A streak's path, from its star's kind, direction and seed. */
const pathOf = (
  kind: number,
  theta: number,
  seed: number,
  config: PopConfig
): Path => {
  const time = seconds(config);
  const long = kind === LONG;
  return {
    theta,
    from: config.radius * START,
    to:
      config.radius *
      (long ? 1 : SHORT_REACH) *
      (1 + REACH_JITTER * (2 * noise(seed, 0) - 1)),
    // Counter-clockwise on screen, where y points down, is negative.
    swirl: -degToRad(config.swirl),
    drag: STREAK_DRAG / time,
    delay: long ? 0 : SHORT_DELAY * time,
  };
};

/**
 * Sets how a star looks `t` seconds into the pop. Hidden until its launch,
 * it leads its streak as a small tip, blooms with an overshoot as the streak
 * shrinks into it, then twinkles, turns with the swirl, and shrinks away.
 */
const shine = (
  p: Particle,
  config: PopConfig,
  path: Path,
  at: Place,
  t: number
): void => {
  if (t < path.delay) {
    p.alpha = 0;
    return;
  }
  const time = seconds(config);
  const seed = p.s2;
  const since = at.flown / time;
  const bloom = lerp(
    TIP,
    1,
    easeOutBack(clamp((since - BLOOM_FROM) / (BLOOM_TO - BLOOM_FROM), 0, 1))
  );
  // A twinkle dips the star's size and brightness, and sets in smoothly.
  const twinkling = since - BLOOM_TO;
  let dip = 0;
  if (twinkling > 0) {
    const rate = lerp(TWINKLE_MIN, TWINKLE_MAX, noise(seed, 1));
    const phase = Math.PI * 2 * (rate * twinkling + noise(seed, 2));
    dip =
      (easeInOutCubic(clamp(twinkling / TWINKLE_RAMP, 0, 1)) *
        (1 - Math.cos(phase))) /
      2;
  }
  const shrink = easeOutCubic(clamp((p.life - p.age) / (SHRINK * time), 0, 1));
  p.alpha = 1 - TWINKLE_DIM * dip;
  p.scale = sizeOf(p.s0, seed) * bloom * (1 - TWINKLE_SHRINK * dip) * shrink;
  p.rotation = at.direction + SPIN * path.swirl * since * at.covered;
};

/**
 * Sets how a streak looks: as long as `at` says, pointing along the path,
 * and fading as it shrinks shorter than its star, and at its end.
 */
const streak = (
  p: Particle,
  config: PopConfig,
  at: Place,
  kind: number
): void => {
  const base = sizeOf(kind, p.s2);
  const width = config.size * base;
  const stretch = width > 0 ? at.length / width : 0;
  p.rotation = at.direction;
  p.scale = base;
  p.scaleX = stretch;
  p.alpha =
    clamp(stretch, 0, 1) *
    clamp((p.life - p.age) / (TAIL_FADE * seconds(config)), 0, 1);
};

/** Sets how a dot of the ring looks, once the ring has covered `covered` of its way. */
const ring = (
  p: Particle,
  config: PopConfig,
  t: number,
  covered: number
): void => {
  const spent = clamp(t / (RING_LIFE * seconds(config)), 0, 1);
  p.scale = 1 - THIN * covered;
  p.alpha = 1 - spent * spent;
};

/** Sets how the flash looks `t` seconds into the pop. */
const glow = (p: Particle, config: PopConfig, t: number): void => {
  const x = clamp(t / (FLASH_LIFE * seconds(config)), 0, 1);
  p.scale = lerp(FLASH_FROM, 1, easeOutCubic(x));
  p.alpha = FLASH_ALPHA * (1 - x);
};

/**
 * Adds a star's streak, `t` seconds into the pop, at the star's place `at`,
 * where the star now is. The first star adds the flash and the ring too.
 * Each is set up as it would be `t` seconds in, and keeps `t` in its `s3`,
 * so it is in step with the stars at any frame rate.
 */
const emit = (
  p: Particle,
  config: PopConfig,
  ctx: UpdateContext,
  path: Path,
  at: Place,
  t: number
): void => {
  const time = seconds(config);
  const colours = config.colors.length;
  const kind = p.s0;
  const theta = p.s1;
  const seed = p.s2;
  const lead = p.s3 === LEAD;
  const tailSprite = colours + p.sprite;

  const tailLife = path.delay + TAIL_LIFE * time - t;
  if (tailLife > 0) {
    ctx.spawn((s) => {
      s.s0 = kind + LONG_TAIL;
      s.s1 = theta;
      s.s2 = seed;
      s.s3 = t;
      s.sprite = tailSprite;
      s.life = tailLife;
      streak(s, config, at, kind);
    });
  }
  if (!lead) return;

  // The flash, at the centre, under where the star now is.
  const flashLife = FLASH_LIFE * time - t;
  if (flashLife > 0) {
    ctx.spawn((f) => {
      f.s0 = FLASH;
      f.s3 = t;
      f.sprite = colours * 2 + 1;
      f.life = flashLife;
      f.x -= at.x;
      f.y -= at.y;
      glow(f, config, t);
    });
  }

  // The ring's dots, evenly spaced from where the circle of stars starts.
  const dots = Math.max(0, Math.floor(config.dots));
  const ringLife = RING_LIFE * time - t;
  if (ringLife <= 0) return;
  const turn = createRng(ctx.rng.seed ^ SHARED).next() * Math.PI * 2;
  const covered = ringAt(RING_DRAG / time, t);
  const r = config.radius * lerp(RING_FROM, RING_TO, covered);
  for (let j = 0; j < dots; j++) {
    const angle = turn + (Math.PI * 2 * j) / dots;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    ctx.spawn((d) => {
      d.s0 = DOT;
      d.s1 = cos;
      d.s2 = sin;
      d.s3 = t;
      d.sprite = colours * 2;
      d.life = ringLife;
      d.x += r * cos - at.x;
      d.y += r * sin - at.y;
      ring(d, config, t, covered);
    });
  }
};

/**
 * A pop, for likes, favourites and follows: a button-sized bloom in three
 * layers. A soft flash lights the centre for its first 0.1 s. A ring of
 * fine dots races out ahead, thinning and fading as it slows, like a
 * shockwave. Long and short streaks shoot out in turn around the circle on
 * a gentle swirl, each shrinking into the four-point star at its tip as it
 * slows, and the stars twinkle, turn and shrink away.
 *
 * Everything is placed on its closed-form path rather than pushed (see
 * `placeAt`), with its velocity left at 0, and timed in shares of
 * `lifetime`, so a pop is the same at any frame rate, and a longer
 * `lifetime` plays the same pop slower. Halos are baked into the sprites,
 * so the normal blend shows on light pages as well as dark.
 *
 * `count` is the stars. On its first step each adds its streak, and the
 * first adds the flash and the ring.
 *
 * Slots: `s0` is the role. A star's `s1` is its direction in radians, `s2`
 * its seed, which sets its reach, size and twinkle, and `s3` what it still
 * has to add. A streak's `s1` and `s2` are its star's, and `s3` how many
 * seconds into the pop it was added. A dot's `s1` and `s2` are the cosine
 * and sine of its direction, and its `s3` and the flash's are when they
 * were added.
 */
export const pop: Effect<PopConfig> = /* @__PURE__ */ defineEffect<PopConfig>({
  name: 'pop',
  blend: 'normal',
  defaults: {
    count: 10,
    dots: 24,
    size: 10,
    radius: 60,
    swirl: 20,
    lifetime: 800,
    colors: ['#FF4D79', '#F59E0B', '#8B5CF6', '#1FB2F5'],
  },
  sprites: (config) => {
    const { colors, size } = config;
    const first = colors[0];
    if (first === undefined) return [];
    return [
      ...colors.map((color) => star(color, size)),
      ...colors.map((color) => tail(color, size)),
      dot(first, size * DOT_SIZE),
      flash(first, config.radius * FLASH_SIZE),
    ];
  },
  spawn: (p, config, rng, index) => {
    const stars = Math.max(1, Math.floor(config.count));
    const colours = Math.max(1, config.colors.length);
    // Draws every star shares: where the circle starts, and its first
    // colour. Star `index` takes the next share of the circle and the next
    // colour, so neighbours differ.
    const shared = createRng(rng.seed ^ SHARED);
    const turn = shared.next() * Math.PI * 2;
    const first = shared.int(0, colours);
    const share = (index + rng.range(-JITTER, JITTER)) / stars;
    const seed = rng.int(0, 2 ** 24);
    const kind = index % 2 === 0 ? LONG : SHORT;

    p.s0 = kind;
    p.s1 = (turn + share * Math.PI * 2) % (Math.PI * 2);
    p.s2 = seed;
    p.s3 = index === 0 ? LEAD : FRESH;
    p.sprite = (first + index) % colours;
    // Stars end at slightly different times, and all by `lifetime`.
    p.life *= 1 - END_JITTER * noise(seed, 3);
    const path = pathOf(kind, p.s1, seed, config);
    const at = placeAt(path, 0);
    p.x += at.x;
    p.y += at.y;
    shine(p, config, path, at, 0);
  },
  update: (p, dt, config, ctx) => {
    const role = p.s0;
    if (role === FLASH) {
      glow(p, config, p.age + p.s3);
      return;
    }
    if (role === DOT) {
      const t = p.age + p.s3;
      const drag = RING_DRAG / seconds(config);
      const covered = ringAt(drag, t);
      const out =
        config.radius *
        (RING_TO - RING_FROM) *
        (covered - ringAt(drag, t - dt));
      p.x += out * p.s1;
      p.y += out * p.s2;
      ring(p, config, t, covered);
      return;
    }
    // A star or its streak, placed on their path: moved by the change in
    // its closed form over the step.
    const isTail = role >= LONG_TAIL;
    const kind = isTail ? role - LONG_TAIL : role;
    const t = p.age + (isTail ? p.s3 : 0);
    const path = pathOf(kind, p.s1, p.s2, config);
    const was = placeAt(path, t - dt);
    const at = placeAt(path, t);
    p.x += at.x - was.x;
    p.y += at.y - was.y;
    if (isTail) {
      streak(p, config, at, kind);
      return;
    }
    if (p.s3 !== DONE) {
      emit(p, config, ctx, path, at, t);
      p.s3 = DONE;
    }
    shine(p, config, path, at, t);
  },
});
