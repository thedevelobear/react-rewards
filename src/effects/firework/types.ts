import type { EffectConfig } from '@/core/define-effect';

/** The firework's settings, in the units of ADR 0024. */
export interface FireworkConfig extends EffectConfig {
  /** Rockets per burst. They launch from the same spot, a moment apart. */
  count: number;
  /** A star's diameter in CSS pixels. Trails and sparks are smaller, and everything glows past its size. */
  size: number;
  /** One sprite per colour. Each shell takes the next colour. Willows burn gold, and crackles pop into amber sparks. */
  colors: readonly string[];
  /** The launch direction in degrees, counter-clockwise from the right. 90 is up. */
  angle: number;
  /** The width of the fan the rockets launch in around `angle`, in degrees. */
  spread: number;
  /** A rocket's average launch speed, in pixels per second. */
  velocity: number;
  /** Air resistance per second on a rocket. It slows the climb, and the shell bursts just before the top. */
  drag: number;
  /** Downward acceleration, in pixels per second squared. It slows the rockets and makes the stars droop. */
  gravity: number;
  /** How far a rocket spirals around its path, in CSS pixels. 0 flies straight. */
  spiral: number;
  /** Stars per shell. Willows have half as many and crackles three quarters, since their stars leave trails or pop. */
  stars: number;
  /** How far a shell's stars spread from where it bursts, in CSS pixels. */
  radius: number;
  /** How often a shell bursts as a peony, a ball of coloured stars that droop and fade, against `willow` and `crackle`. */
  peony: number;
  /** How often a shell bursts as a willow, gold stars whose long trails hang and droop, against `peony` and `crackle`. */
  willow: number;
  /** How often a shell bursts as a crackle, stars that flicker, go dark and pop into glittering sparks, against `peony` and `willow`. */
  crackle: number;
  /** How long the show lasts, in milliseconds. Every rocket, star and spark is gone by then. */
  lifetime: number;
}

/** What a rocket's flight depends on, read from its particle and config. */
export interface Rocket {
  /** The launch velocity, in pixels per second. */
  ux: number;
  uy: number;
  /** The launch speed, in pixels per second. */
  speed: number;
  /** Air resistance per second. */
  drag: number;
  /** Downward acceleration, in pixels per second squared. */
  gravity: number;
  /** The spiral's full radius, in pixels. */
  spiral: number;
  /** Where the spiral starts, in radians. */
  phase: number;
  /** Radians the spiral turns per pixel climbed. Negative turns the other way. */
  turn: number;
}

/** A trail spark to add, relative to where its parent's children appear. */
export interface Emission {
  /** Where the parent was when it laid the spark, in CSS pixels. */
  x: number;
  y: number;
  /** The parent's velocity then, in pixels per second. */
  vx: number;
  vy: number;
  /** The stretch of path the spark stands for, in pixels. */
  length: number;
  /** The share of the parent's velocity the spark keeps. */
  keep: number;
  /** How near the parent was around its spiral, from -1 (far) to 1 (near). */
  depth: number;
  /** Seconds from when it was laid to the step's end. */
  lag: number;
  /** Seconds it lives from the step's end. */
  life: number;
  /** Seconds it would live from when it was laid. */
  natural: number;
  /** Its seed. */
  seed: number;
}

/** A straight stretch of a willow star's path, to lay its trail along. */
export interface Leg {
  /** The star's seed. */
  seed: number;
  /** The straight move across it, from where the star's children appear, in CSS pixels. */
  dx: number;
  dy: number;
  /** The star's velocity at its start, in pixels per second. */
  vx: number;
  vy: number;
  /** The star's air resistance per second. */
  drag: number;
  /** Seconds the star took over it. */
  time: number;
  /** Pixels the star had travelled since the burst before it. */
  from: number;
  /** Seconds left in the show at its end. */
  left: number;
  /** Seconds before its end that the star burned out, or 0. */
  out: number;
}

/** Where a rocket is, some seconds after launch. */
export interface Flight {
  /** The offset from the launch point, in CSS pixels. */
  x: number;
  y: number;
  /** The velocity, in pixels per second. */
  vx: number;
  vy: number;
  /** How far the rocket has gone along its launch direction, in pixels. */
  climbed: number;
  /** How fast `climbed` grows, in pixels per second. */
  rate: number;
  /** How near the rocket is around its spiral, from -1 (far) to 1 (near). */
  depth: number;
}
