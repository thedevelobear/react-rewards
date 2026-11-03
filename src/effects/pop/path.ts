import type { Path, Place } from './types';

/**
 * How many times as much of its way a star had left when it was where its
 * streak's tail is: the streak spans the last `ln TRAIL / k` seconds.
 */
const TRAIL = 3;

/**
 * Where a streak is `t` seconds into the pop, in closed form, so it is exact
 * at any frame rate. Launched at `delay` and slowed by drag `k`, it has
 * covered the share `q = 1 - exp(-k·τ)` of its way `τ` seconds after the
 * launch. Its star is then `from + (to - from)·q` from the centre, turned
 * `swirl·q` around it, so the path is a gentle spiral that ends with the
 * star at rest, `swirl` round from where it set off.
 *
 * The streak behind the star shows where the star was `ln 3 / k` seconds
 * ago, so it reaches back to the start until the star is two thirds of the
 * way, and is then twice as long as the way the star still has to go: it
 * shrinks into the star as the star stops. Its length is measured along the
 * path, and it points along the path's tangent halfway along it.
 */
export const placeAt = (path: Path, t: number): Place => {
  const { theta, from, swirl, drag } = path;
  const flown = Math.max(0, t - path.delay);
  const left = Math.exp(-drag * flown);
  const q = 1 - left;
  // Where the streak's tail is: the way covered `ln 3 / k` earlier, when
  // `TRAIL` times as much of it was left.
  const back = Math.max(0, 1 - TRAIL * left);
  const span = path.to - from;
  const r = from + span * q;
  const angle = theta + swirl * q;
  const middle = (q + back) / 2;
  const across = (from + span * middle) * swirl;
  return {
    x: r * Math.cos(angle),
    y: r * Math.sin(angle),
    direction: theta + swirl * middle + Math.atan2(across, span),
    length: (q - back) * Math.hypot(span, across),
    flown,
    covered: q,
  };
};

/**
 * The share of its way the ring has covered `t` seconds in, under drag `k`:
 * `1 - exp(-k·t)`.
 */
export const ringAt = (drag: number, t: number): number =>
  1 - Math.exp(-drag * Math.max(0, t));

/** The overshoot in `easeOutBack`, which peaks at 1.25 halfway. */
const BACK = 3;

/** An ease out that overshoots to 1.25 and settles back to 1. */
export const easeOutBack = (t: number): number => {
  const x = t - 1;
  return 1 + (BACK + 1) * x * x * x + BACK * x * x;
};
