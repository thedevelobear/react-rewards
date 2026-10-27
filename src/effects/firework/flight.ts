import { clamp, lerp } from '@/core/math';
import type { Flight, Rocket } from './types';

/** Below this drag, per second, the closed forms take their drag-free limit. */
const STILL = 1e-6;
/** The share of the time to the top of its climb at which a shell bursts. */
const FUSE = 0.9;
/** A rocket's fuse when nothing slows it down, in seconds. */
const FUSE_UNSLOWED = 1;
/** The climb over which the spiral opens to its full radius, in pixels. */
const OPEN = 45;

/**
 * How far something moves in `t` seconds from velocity `v`, under constant
 * acceleration `a` and linear drag `k`: the integral of `accelerate`.
 */
export const drift = (v: number, a: number, k: number, t: number): number =>
  k > STILL
    ? (a / k) * t + ((v - a / k) * -Math.expm1(-k * t)) / k
    : v * t + (a * t * t) / 2;

/**
 * Seconds from launch to the burst: 0.9 of the time a rocket fired straight
 * up at `speed` takes to stop rising, `ln(1 + speed·k/g) / k`. Without
 * gravity, it is when drag has taken 90% of the speed, `ln 10 / k`.
 */
export const fuse = (speed: number, k: number, g: number): number => {
  if (g > 0) {
    return FUSE * (k > STILL ? Math.log1p((speed * k) / g) / k : speed / g);
  }
  return k > STILL ? Math.LN10 / k : FUSE_UNSLOWED;
};

/**
 * A rocket's offset and velocity `t` seconds after launch, in closed form,
 * so it is exact at any frame rate. Under gravity `g` and drag `k`, from
 * launch velocity `u`, with `e = exp(-k·t)`:
 *
 *   x = ux·(1 - e) / k
 *   y = uy·(1 - e) / k + g·(t - (1 - e) / k) / k
 *
 * Around that path, the rocket spirals a helix of constant pitch: it turns
 * by `turn` radians per pixel climbed, and its radius opens from 0 at the
 * launch to `spiral` as `1 - exp(-climbed / 45)`. Seen from the side, the
 * helix is a sideways sine, and its depth is the cosine.
 */
export const flight = (rocket: Rocket, t: number): Flight => {
  const { ux, uy, speed, drag: k, gravity: g } = rocket;
  const e = Math.exp(-k * t);
  // The integrals of e and of (1 - e) / k from 0 to t.
  const f = k > STILL ? -Math.expm1(-k * t) / k : t;
  const h = k > STILL ? (t - f) / k : (t * t) / 2;
  // Along the launch direction, and the unit vector across it.
  const along = speed > 0 ? uy / speed : 0;
  const nx = speed > 0 ? -uy / speed : 1;
  const ny = speed > 0 ? ux / speed : 0;
  const climbed = speed * f + along * g * h;
  const rate = speed * e + along * g * f;

  const height = Math.max(climbed, 0);
  const open = -Math.expm1(-height / OPEN);
  const opening = climbed > 0 ? (1 - open) / OPEN : 0;
  const phase = rocket.phase + rocket.turn * height;
  const sin = Math.sin(phase);
  const cos = Math.cos(phase);
  const side = rocket.spiral * open * sin;
  const sideRate =
    rocket.spiral * (opening * sin + open * cos * rocket.turn) * rate;

  return {
    x: ux * f + nx * side,
    y: uy * f + g * h + ny * side,
    vx: ux * e + nx * sideRate,
    vy: uy * e + g * f + ny * sideRate,
    climbed,
    rate,
    depth: open * cos,
  };
};

/**
 * The time, between `from` and `to` seconds after launch, at which the
 * rocket has climbed `distance`: a straight-line guess between the flights
 * `start` and `end` at those times, then two Newton steps on the closed
 * form.
 */
export const climbTime = (
  rocket: Rocket,
  distance: number,
  from: number,
  to: number,
  start: Flight,
  end: Flight
): number => {
  const span = end.climbed - start.climbed;
  let t = span > 0 ? lerp(from, to, (distance - start.climbed) / span) : to;
  for (let i = 0; i < 2; i++) {
    const at = flight(rocket, t);
    if (at.rate <= 0) break;
    t = clamp(t - (at.climbed - distance) / at.rate, from, to);
  }
  return t;
};
