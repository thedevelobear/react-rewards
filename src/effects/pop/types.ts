import type { EffectConfig } from '@/core/define-effect';

/** The pop's settings, in the units of ADR 0024. */
export interface PopConfig extends EffectConfig {
  /** Stars per pop, each shot out on its own streak. Every other one is smaller and lands nearer the centre. */
  count: number;
  /** Dots in the ring that races out ahead of the streaks. 0 leaves the ring out. */
  dots: number;
  /** A star's width from tip to tip, in CSS pixels. Streaks and dots are drawn to scale with it. */
  size: number;
  /** How far the long streaks' stars land from the centre, in CSS pixels. Short ones land at 0.62 of it, and the ring races a little further. */
  radius: number;
  /** How far the streaks curve around the centre on their way out, in degrees. Positive turns counter-clockwise. */
  swirl: number;
  /** How long the pop lasts, in milliseconds. Every part keeps its share of it, so a longer pop plays slower. */
  lifetime: number;
  /** One sprite per colour. Streaks take the colours in turn, and the flash and the ring take the first. */
  colors: readonly string[];
}

/** One streak's path, read from its particle and config. */
export interface Path {
  /** The launch direction, in radians clockwise from the right (y down). */
  theta: number;
  /** Where the streak starts and where its star lands, in pixels from the centre. */
  from: number;
  to: number;
  /** How far the path turns around the centre by the end, in radians clockwise. */
  swirl: number;
  /** Air resistance per second. */
  drag: number;
  /** Seconds from the pop's start to the launch. */
  delay: number;
}

/** Where a streak is, some seconds into the pop. */
export interface Place {
  /** The star's offset from the centre, in CSS pixels. */
  x: number;
  y: number;
  /** The direction the streak points, in radians clockwise from the right. */
  direction: number;
  /** The streak's length behind its star, in CSS pixels. */
  length: number;
  /** Seconds since the launch, or 0 before it. */
  flown: number;
  /** The share of its way the star has covered, from 0 to 1. */
  covered: number;
}

/** A colour's red, green and blue, from 0 to 255. */
export type Rgb = readonly [number, number, number];
