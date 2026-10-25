import {
  defineEffect,
  type Effect,
  type Particle,
  type UpdateContext,
} from '@/core/define-effect';
import {
  accelerate,
  clamp,
  createRng,
  damp,
  degToRad,
  lerp,
} from '@/core/math';
import { climbTime, drift, flight, fuse } from './flight';
import { flash, glow } from './glow';
import { noise, seedOf } from './noise';
import type { Emission, FireworkConfig, Flight, Leg, Rocket } from './types';

/*
 * Roles, kept in slot `s0`. The first three are also the kinds of shell. A
 * rocket's `s0` is negative instead (see `firework`).
 */
const PEONY = 0;
const WILLOW = 1;
const CRACKLE = 2;
const TRAIL = 3;
const SPARK = 4;
const FLASH = 5;

/** Willow stars and trails, the orange-gold of burning charcoal. */
const GOLD = '#FFA944';
/** Crackle sparks, white-gold. */
const SPARKLE = '#FFF1C9';

/** Mixed into the burst's seed for the draws a volley's rockets share. */
const VOLLEY = 0x2f6b9d3;
/** The latest a rocket launches after the first, in seconds. */
const STAGGER = 0.45;
/** How far a rocket strays from the middle of its share of the fan. */
const FAN = 0.3;
/** The slowest and fastest launch, as shares of `velocity`. */
const LAUNCH_MIN = 0.9;
const LAUNCH_MAX = 1.1;
/** Pixels climbed per turn of the spiral. */
const PITCH = 44;
/** How much a rocket grows as it comes round the near side of its spiral. */
const DEPTH = 0.25;
/** A rocket's size, as a multiple of a star's. */
const HEAD = 1.2;
/**
 * The least time a rocket leaves its shell before the show ends, in seconds.
 * A rocket launches sooner if it must.
 */
const SHOW = 1;
/** Seconds a dud fades over before the show ends. */
const ROCKET_FADE = 0.2;

/** Pixels between a rocket's trail sparks, and between a willow star's. */
const ROCKET_SPACING = 5;
const WILLOW_SPACING = 9;
/** A trail spark's diameter, as a share of a star's. */
const TRAIL_SIZE = 0.6;
/** The shortest and longest a trail spark lives, behind a rocket and a willow star, in seconds. */
const ROCKET_TRAIL_MIN = 0.4;
const ROCKET_TRAIL_MAX = 0.65;
const WILLOW_TRAIL_MIN = 1.2;
const WILLOW_TRAIL_MAX = 1.8;
/** The share of its parent's velocity a trail spark keeps. */
const ROCKET_TRAIL_KEEP = 0.12;
const WILLOW_TRAIL_KEEP = 0.05;
/** How fast a trail spark drifts on its own, in pixels per second (one standard deviation). */
const TRAIL_JITTER = 9;
/** A trail spark's air resistance per second. */
const TRAIL_DRAG = 8;
/** A trail spark's size at the end of its life, as a share of its first. */
const TRAIL_END = 0.35;
/** How much a trail spark's brightness flickers, as a share. */
const TRAIL_TWINKLE = 0.3;
/**
 * How much brighter and bigger a rocket's trail spark is when laid on the
 * near side of the spiral, and dimmer and smaller on the far side.
 */
const TRAIL_DEPTH = 0.4;

/**
 * The golden angle, π · (3 - √5) radians, which spreads a shell's stars
 * evenly around it. It is written out because bundlers keep a top-level call
 * such as `Math.sqrt` even in apps that don't use the effect (ADR 0055).
 */
const GOLDEN = 2.399963229728653;
/** How much a star's speed varies either way, as a share. */
const STAR_JITTER = 0.08;
/** Seconds of motion a star's streak shows: it is drawn as long as it moves in that time. */
const STREAK = 0.025;
/*
 * Per kind of shell, indexed by `PEONY`, `WILLOW` and `CRACKLE`: a star's
 * air resistance per second, how far it reaches as a share of `radius`, the
 * shell's stars as a share of `stars`, the shortest and longest a star
 * burns in seconds, and the seconds it fades over at the end.
 */
const DRAG = [4, 3, 4.5] as const;
const REACH = [1, 0.8, 0.85] as const;
const SHARE = [1, 0.5, 0.75] as const;
const BURN_MIN = [1, 1.2, 0.45] as const;
const BURN_MAX = [1.35, 1.6, 0.7] as const;
const FADE = [0.35, 0.5, 0] as const;

/** A crackle star flickers for this long at the end of its burn, in seconds. */
const FLICKER = 0.2;
/** Flickers per second. */
const FLICKER_HZ = 12.5;
/** A flickering star's brightness and size between flashes, and its size in them. */
const FLICKER_DIM = 0.15;
const FLICKER_GROW = 1.4;
/** The shortest and longest a crackle star stays dark before it pops, in seconds. */
const GAP_MIN = 0.12;
const GAP_MAX = 0.22;
/** Sparks per crackle star. */
const SPARKS = 6;
/** A spark's diameter, as a share of a star's. */
const SPARK_SIZE = 0.6;
/**
 * How far a spark pops at most, as a share of `radius`, and its air
 * resistance per second. Sparks pop 0.3 to 1 times as far, so they scatter
 * rather than ring.
 */
const SPARK_REACH = 0.16;
const SPARK_DRAG = 6;
/** The shortest and longest a spark lives, and the seconds it fades over. */
const SPARK_MIN = 0.3;
const SPARK_MAX = 0.55;
const SPARK_FADE = 0.2;
/** How often a spark's brightness changes, per second, and its dimmest. */
const GLITTER_HZ = 24;
const GLITTER_MIN = 0.4;
/** How much bigger a spark is as it pops, and for how many seconds. */
const POP = 1.5;
const POP_TIME = 0.08;

/** A burst's flash: its size as a multiple of a star's, its life in seconds, and its brightness. */
const FLASH_SIZE = 12;
const FLASH_LIFE = 0.2;
const FLASH_ALPHA = 0.8;

/*
 * The sprites, after one per colour: `GOLD` stars, `GOLD` trail sparks,
 * `SPARKLE` sparks and the flash.
 */
const goldSprite = (config: FireworkConfig) => config.colors.length;
const trailSprite = (config: FireworkConfig) => config.colors.length + 1;
const sparkSprite = (config: FireworkConfig) => config.colors.length + 2;
const flashSprite = (config: FireworkConfig) => config.colors.length + 3;

/** The kind of shell that sits at `share` (0 to 1) of the weights. */
const kindAt = (share: number, config: FireworkConfig): number => {
  const peony = Math.max(config.peony, 0);
  const willow = Math.max(config.willow, 0);
  const total = peony + willow + Math.max(config.crackle, 0);
  if (!(total > 0)) return PEONY;
  const at = share * total;
  return at < peony ? PEONY : at < peony + willow ? WILLOW : CRACKLE;
};

/** A rocket's seed and kind, `seed * 4 + kind`, from its negative `s0`. */
const codeOf = (p: Particle): number => -p.s0 - 1;

const rocketOf = (p: Particle, config: FireworkConfig): Rocket => {
  const seed = Math.floor(codeOf(p) / 4);
  return {
    ux: p.s1,
    uy: p.s2,
    speed: Math.hypot(p.s1, p.s2),
    drag: config.drag,
    gravity: config.gravity,
    spiral: config.spiral,
    phase: noise(seed, 0) * Math.PI * 2,
    turn: ((noise(seed, 1) < 0.5 ? -1 : 1) * Math.PI * 2) / PITCH,
  };
};

/** How long a crackle star stays dark before it pops. */
const gapOf = (seed: number): number => lerp(GAP_MIN, GAP_MAX, noise(seed, 2));

/**
 * Sets what a star, trail spark, spark or flash looks like now. It reads
 * only the particle, so a child looks right from the frame it appears in.
 */
const look = (p: Particle, config: FireworkConfig): void => {
  const left = p.life - p.age;
  const role = p.s0;
  if (role === TRAIL) {
    const share = clamp(left / p.s1, 0, 1);
    const twinkle = noise(p.s2, 8 + Math.floor(p.age * GLITTER_HZ));
    const near = 1 + TRAIL_DEPTH * p.s3;
    p.alpha = share * (1 - TRAIL_TWINKLE * twinkle) * near;
    p.scale = lerp(TRAIL_END, 1, share) * near;
    return;
  }
  if (role === SPARK) {
    const age = p.age + p.s1;
    const glitter = noise(p.s2, 8 + Math.floor(age * GLITTER_HZ));
    p.alpha = clamp(left / SPARK_FADE, 0, 1) * lerp(GLITTER_MIN, 1, glitter);
    const pop = Math.max(0, 1 - age / POP_TIME);
    p.scale = 1 + POP * pop * pop;
    return;
  }
  if (role === FLASH) {
    const share = clamp(left / FLASH_LIFE, 0, 1);
    p.alpha = FLASH_ALPHA * share * share;
    p.scale = lerp(1.2, 0.6, share);
    return;
  }
  // A star, streaked along its motion.
  const speed = Math.hypot(p.vx, p.vy);
  p.rotation = Math.atan2(p.vy, p.vx);
  p.scaleX = config.size > 0 ? 1 + (speed * STREAK) / config.size : 1;
  if (role !== CRACKLE) {
    p.alpha = clamp(left / FADE[role as 0 | 1], 0, 1);
    return;
  }
  // A crackle star flashes and dims, then goes dark until it pops.
  const flicker = left - gapOf(p.s2);
  const on = Math.floor(flicker * FLICKER_HZ * 2) % 2 === 0;
  const flickering = flicker > 0 && flicker < FLICKER;
  p.alpha = flicker <= 0 ? 0 : flickering && !on ? FLICKER_DIM : 1;
  p.scale = flickering && on ? FLICKER_GROW : 1;
};

/**
 * Adds a trail spark. It is laid as a segment `length` long along its
 * parent's velocity, centred half a length back, so the segments join into
 * a line.
 */
const trail = (
  ctx: UpdateContext,
  config: FireworkConfig,
  spark: Emission
): void => {
  const { x, y, vx, vy, length, lag, life, natural, seed } = spark;
  const speed = Math.hypot(vx, vy);
  const back = speed > 0 ? length / 2 / speed : 0;
  // Its own drift, from a bell curve (Box-Muller).
  const jitter = TRAIL_JITTER * Math.sqrt(-2 * Math.log(1 - noise(seed, 1)));
  const angle = noise(seed, 2) * Math.PI * 2;
  const svx = vx * spark.keep + jitter * Math.cos(angle);
  const svy = vy * spark.keep + jitter * Math.sin(angle);
  const g = config.gravity;
  const core = config.size * TRAIL_SIZE;
  const sprite = trailSprite(config);
  ctx.spawn((t) => {
    t.s0 = TRAIL;
    t.s1 = natural;
    t.s2 = seed;
    t.s3 = spark.depth;
    t.sprite = sprite;
    t.x += x - vx * back + drift(svx, 0, TRAIL_DRAG, lag);
    t.y += y - vy * back + drift(svy, g, TRAIL_DRAG, lag);
    t.vx = damp(svx, TRAIL_DRAG, lag);
    t.vy = accelerate(svy, g, TRAIL_DRAG, lag);
    t.rotation = Math.atan2(vy, vx);
    t.scaleX = core > 0 ? Math.max(1, length / core) : 1;
    t.life = life;
    look(t, config);
  });
};

/**
 * How far something travels along its path in `t` seconds from velocity
 * `vx`, `vy`, under gravity `g` and drag `k`, by Simpson's rule on its exact
 * speed. Summing the straight moves the simulation makes instead would come
 * up short on a curve by more the longer the step.
 */
const arc = (vx: number, vy: number, k: number, g: number, t: number) =>
  (t / 6) *
  (Math.hypot(vx, vy) +
    4 * Math.hypot(damp(vx, k, t / 2), accelerate(vy, g, k, t / 2)) +
    Math.hypot(damp(vx, k, t), accelerate(vy, g, k, t)));

/**
 * Lays a willow star's trail along one straight stretch of its path: a
 * spark every `WILLOW_SPACING` pixels it has travelled since the burst,
 * each placed and aged by when the star passed that point. Returns the
 * distance travelled at the stretch's end.
 */
const lay = (ctx: UpdateContext, config: FireworkConfig, leg: Leg): number => {
  const { dx, dy, vx, vy, drag, time, from } = leg;
  const g = config.gravity;
  const length = arc(vx, vy, drag, g, time);
  const to = from + length;
  if (!(length > 0)) return to;
  for (
    let n = Math.floor(from / WILLOW_SPACING) + 1;
    n * WILLOW_SPACING <= to;
    n++
  ) {
    const share = (n * WILLOW_SPACING - from) / length;
    const lag = (1 - share) * time;
    // Nothing is laid after the star burns out.
    if (lag < leg.out) continue;
    const seed = seedOf(leg.seed, n);
    const natural = lerp(WILLOW_TRAIL_MIN, WILLOW_TRAIL_MAX, noise(seed, 0));
    const life = Math.min(natural - lag, leg.left);
    if (life <= 0) continue;
    // Its velocity when it laid the spark.
    const at = time - lag;
    trail(ctx, config, {
      x: dx * share,
      y: dy * share,
      vx: damp(vx, drag, at),
      vy: accelerate(vy, g, drag, at),
      length: WILLOW_SPACING,
      keep: WILLOW_TRAIL_KEEP,
      depth: 0,
      lag,
      life,
      natural,
      seed,
    });
  }
  return to;
};

/**
 * Bursts a shell `over` seconds before the step's end, at the rocket's
 * position, with the rocket's velocity `at`. `left` is the seconds left in
 * the show at the step's end.
 */
const burst = (
  p: Particle,
  config: FireworkConfig,
  ctx: UpdateContext,
  at: Flight,
  over: number,
  left: number
): void => {
  const code = codeOf(p);
  const seed = Math.floor(code / 4);
  const kind = (code % 4) as 0 | 1 | 2;
  const g = config.gravity;

  const shine = Math.min(FLASH_LIFE - over, left);
  if (shine > 0) {
    const sprite = flashSprite(config);
    ctx.spawn((f) => {
      f.s0 = FLASH;
      f.s2 = seed;
      f.sprite = sprite;
      f.life = shine;
      look(f, config);
    });
  }

  // The stars are evenly spread over a sphere (a Fibonacci lattice) seen
  // from the front, so they ring the edge and fill the middle, as a real
  // shell's do. Each carries the rocket's velocity.
  const k = DRAG[kind];
  const speed = config.radius * k * REACH[kind];
  const total = Math.max(0, Math.round(config.stars * SHARE[kind]));
  const turn = noise(seed, 2) * Math.PI * 2;
  const sprite = kind === WILLOW ? goldSprite(config) : p.sprite;
  for (let i = 0; i < total; i++) {
    const star = seedOf(seed, i);
    const burn = lerp(BURN_MIN[kind], BURN_MAX[kind], noise(star, 1));
    const natural = kind === CRACKLE ? burn + FLICKER + gapOf(star) : burn;
    const life = Math.min(natural - over, left);
    if (life <= 0) continue;
    const z = 1 - (2 * i + 1) / total;
    const out =
      Math.sqrt(1 - z * z) *
      speed *
      (1 + STAR_JITTER * (2 * noise(star, 0) - 1));
    const angle = turn + i * GOLDEN;
    const vx = Math.cos(angle) * out + at.vx;
    const vy = Math.sin(angle) * out + at.vy;
    // Where it is and how fast it goes at the step's end.
    const dx = drift(vx, 0, k, over);
    const dy = drift(vy, g, k, over);
    const ex = damp(vx, k, over);
    const ey = accelerate(vy, g, k, over);
    const travelled =
      kind === WILLOW
        ? lay(ctx, config, {
            seed: star,
            dx,
            dy,
            vx,
            vy,
            drag: k,
            time: over,
            from: 0,
            left,
            out: 0,
          })
        : 0;
    ctx.spawn((s) => {
      s.s0 = kind;
      s.s1 = left;
      s.s2 = star;
      s.s3 = travelled;
      s.sprite = sprite;
      s.x += dx;
      s.y += dy;
      s.vx = ex;
      s.vy = ey;
      s.life = life;
      look(s, config);
    });
  }
};

/** Pops a crackle star into sparks. `dx`, `dy` is its move this step. */
const pop = (
  p: Particle,
  dt: number,
  dx: number,
  dy: number,
  config: FireworkConfig,
  ctx: UpdateContext
): void => {
  const over = p.age - p.life;
  const left = p.s1 - p.age;
  // Where it popped, along this step's move, and how fast it went then.
  const share = dt > 0 ? clamp(1 - over / dt, 0, 1) : 1;
  const k = DRAG[CRACKLE];
  const g = config.gravity;
  const svx = damp(p.vx, k, -over);
  const svy = accelerate(p.vy, g, k, -over);
  const turn = noise(p.s2, 3) * Math.PI * 2;
  const sprite = sparkSprite(config);
  for (let j = 0; j < SPARKS; j++) {
    const seed = seedOf(p.s2, j);
    const life = Math.min(
      lerp(SPARK_MIN, SPARK_MAX, noise(seed, 0)) - over,
      left
    );
    if (life <= 0) continue;
    const angle =
      turn + (Math.PI * 2 * (j + 0.8 * (noise(seed, 1) - 0.5))) / SPARKS;
    const speed =
      config.radius * SPARK_REACH * SPARK_DRAG * lerp(0.3, 1, noise(seed, 2));
    const vx = svx + Math.cos(angle) * speed;
    const vy = svy + Math.sin(angle) * speed;
    ctx.spawn((c) => {
      c.s0 = SPARK;
      c.s1 = over;
      c.s2 = seed;
      c.sprite = sprite;
      c.x += dx * share + drift(vx, 0, SPARK_DRAG, over);
      c.y += dy * share + drift(vy, g, SPARK_DRAG, over);
      c.vx = damp(vx, SPARK_DRAG, over);
      c.vy = accelerate(vy, g, SPARK_DRAG, over);
      c.life = life;
      look(c, config);
    });
  }
};

/** Steps a rocket: placed on its closed-form flight, laying its trail. */
const climb = (
  p: Particle,
  dt: number,
  config: FireworkConfig,
  ctx: UpdateContext
): void => {
  const left = config.lifetime / 1000 - p.age;
  const rocket = rocketOf(p, config);
  const time = fuse(rocket.speed, config.drag, config.gravity);
  // A dud's show ends before even an immediate launch would burst.
  const bursts = p.life + 1e-6 >= time;
  const delay = bursts ? p.life - time : 0;

  // Placed, not pushed: its velocity stays 0, and it moves by the change in
  // its closed-form offset.
  const from = clamp(p.age - dt - delay, 0, time);
  const to = clamp(p.age - delay, 0, time);
  const start = flight(rocket, from);
  const at = flight(rocket, to);
  p.x += at.x - start.x;
  p.y += at.y - start.y;

  // A trail spark every `ROCKET_SPACING` pixels climbed, placed and aged by
  // the moment the rocket got there. `s3` counts them.
  const seed = Math.floor(codeOf(p) / 4);
  let count = p.s3;
  while ((count + 1) * ROCKET_SPACING <= at.climbed) {
    count += 1;
    const t = climbTime(rocket, count * ROCKET_SPACING, from, to, start, at);
    const there = flight(rocket, t);
    const spark = seedOf(seed, -count);
    const natural = lerp(ROCKET_TRAIL_MIN, ROCKET_TRAIL_MAX, noise(spark, 0));
    const lag = p.age - delay - t;
    const life = Math.min(natural - lag, left);
    if (life <= 0) continue;
    trail(ctx, config, {
      x: there.x - at.x,
      y: there.y - at.y,
      vx: there.vx,
      vy: there.vy,
      length: ROCKET_SPACING,
      keep: ROCKET_TRAIL_KEEP,
      depth: there.depth,
      lag,
      life,
      natural,
      seed: spark,
    });
  }
  p.s3 = count;

  p.alpha = p.age < delay ? 0 : clamp(left / ROCKET_FADE, 0, 1);
  p.scale = HEAD * (1 + DEPTH * at.depth);
  if (bursts && p.age >= p.life) {
    burst(p, config, ctx, at, p.age - p.life, left);
  }
};

/**
 * Steps a star, trail spark, spark or flash: drag and gravity, then a willow
 * star's trail or a crackle star's pop.
 */
const fly = (
  p: Particle,
  dt: number,
  config: FireworkConfig,
  ctx: UpdateContext
): void => {
  const role = p.s0;
  // The flash stays where the shell burst.
  if (role === FLASH) {
    look(p, config);
    return;
  }
  const drag =
    role <= CRACKLE
      ? DRAG[role as 0 | 1 | 2]
      : role === TRAIL
        ? TRAIL_DRAG
        : SPARK_DRAG;
  const vx = p.vx;
  const vy = p.vy;
  p.vx = damp(vx, drag, dt);
  p.vy = accelerate(vy, config.gravity, drag, dt);
  const dx = ((vx + p.vx) / 2) * dt;
  const dy = ((vy + p.vy) / 2) * dt;
  if (role === WILLOW) {
    p.s3 = lay(ctx, config, {
      seed: p.s2,
      dx,
      dy,
      vx,
      vy,
      drag,
      time: dt,
      from: p.s3,
      left: p.s1 - p.age,
      out: Math.max(0, p.age - p.life),
    });
  } else if (role === CRACKLE && p.age >= p.life) {
    pop(p, dt, dx, dy, config, ctx);
  }
  look(p, config);
};

/**
 * Fireworks. A small volley of rockets launches from one spot, fanned out
 * and a moment apart. Each climbs on a delicate spiral, laying a glittering
 * gold trail, slows under drag and gravity, and bursts just before the top
 * as one of three shells, picked by the weights:
 *
 * - a peony: a ball of coloured stars that streak out, slow, droop and fade;
 * - a willow: gold stars whose long trails hang and droop;
 * - a crackle: coloured stars that flicker, go dark, and pop into
 *   glittering white-gold sparks.
 *
 * Everything is placed and timed in closed form or by a particle's own age,
 * and children are placed and aged by the moment they were made within the
 * step, so a seeded show is the same at any frame rate. Stars, trails and
 * sparks take their randomness from their seed (see `noise`), and the
 * volley's shared draws (the kinds, colours and fan) from a generator seeded
 * by the burst's seed.
 *
 * Slots: `s0` is the role. A rocket's is `-(1 + seed * 4 + kind)`, its `s1`
 * and `s2` its launch velocity, and `s3` how many trail sparks it has laid.
 * Its `life` is its launch delay plus its fuse, or `lifetime` for a dud that
 * can't burst in time. For a star, `s1` is the seconds left in the show when
 * it appeared, `s2` its seed, and `s3` how far a willow star has travelled.
 * For a trail spark, `s1` is its full life, `s2` its seed, and `s3` how near
 * the rocket was around its spiral. For a spark, `s1` is how long before its
 * first frame it popped, and `s2` its seed. A flash's `s2` is its shell's
 * seed.
 */
export const firework: Effect<FireworkConfig> =
  /* @__PURE__ */ defineEffect<FireworkConfig>({
    name: 'firework',
    blend: 'additive',
    defaults: {
      count: 3,
      size: 4,
      colors: ['#FF3B4E', '#4DFF88', '#4D7CFF', '#FFD84A', '#FFFFFF'],
      angle: 90,
      spread: 80,
      velocity: 650,
      drag: 3.5,
      gravity: 180,
      spiral: 3.5,
      stars: 40,
      radius: 80,
      peony: 1,
      willow: 1,
      crackle: 1,
      lifetime: 3500,
    },
    sprites: (config) => [
      ...config.colors.map((color) => glow(color, config.size)),
      glow(GOLD, config.size),
      glow(GOLD, config.size * TRAIL_SIZE),
      glow(SPARKLE, config.size * SPARK_SIZE),
      flash(config.size * FLASH_SIZE),
    ],
    spawn: (p, config, rng, index) => {
      const rockets = Math.max(1, Math.floor(config.count));
      const colours = config.colors.length;
      // Draws every rocket shares: where the kinds, colours and fan start.
      // Rocket `index` takes the next of each, so a volley shows the kinds
      // in proportion to their weights, and different colours.
      const volley = createRng(rng.seed ^ VOLLEY);
      const share = volley.next();
      const colour = volley.int(0, Math.max(colours, 1));
      const slot = (index + volley.int(0, rockets)) % rockets;

      const direction = degToRad(
        config.angle +
          config.spread * ((slot + 0.5 + rng.range(-FAN, FAN)) / rockets - 0.5)
      );
      const speed = config.velocity * rng.range(LAUNCH_MIN, LAUNCH_MAX);
      const wait = rng.next();
      const seed = rng.int(0, 2 ** 21);
      const kind = kindAt((share + index / rockets) % 1, config);

      p.s0 = -(1 + seed * 4 + kind);
      p.s1 = Math.cos(direction) * speed;
      p.s2 = -Math.sin(direction) * speed;
      p.sprite =
        kind === WILLOW || colours === 0
          ? goldSprite(config)
          : (colour + index) % colours;
      // The first rocket launches at once, and the rest within `STAGGER`,
      // or sooner, so each bursts `SHOW` seconds before the show ends. A
      // rocket's life ends at its burst, or at the show's end for a dud.
      const time = fuse(Math.hypot(p.s1, p.s2), config.drag, config.gravity);
      const end = config.lifetime / 1000;
      const delay = Math.min(
        index === 0 ? 0 : (STAGGER * (index - 1 + wait)) / (rockets - 1),
        Math.max(0, end - time - SHOW)
      );
      p.life = Math.min(delay + time, end);
      p.alpha = delay > 0 ? 0 : 1;
      p.scale = HEAD;
    },
    update: (p, dt, config, ctx) => {
      if (p.s0 < 0) climb(p, dt, config, ctx);
      else fly(p, dt, config, ctx);
    },
  });
