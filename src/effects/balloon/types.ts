import type { EffectConfig } from '@/core/define-effect';

/** The balloon's settings, in the units of ADR 0024. */
export interface BalloonConfig extends EffectConfig {
  /** Balloons per burst. */
  count: number;
  /** A balloon's width in CSS pixels. With its string, it is about 3.1 times as tall. */
  size: number;
  /** One sprite per colour. Each balloon picks one at random. */
  colors: readonly string[];
  /** The launch direction in degrees, counter-clockwise from the right. 90 is up. */
  angle: number;
  /** The width of the launch cone around `angle`, in degrees. */
  spread: number;
  /** The average launch speed, in pixels per second. */
  velocity: number;
  /** Air resistance per second. Balloons settle at a speed of `gravity / drag`. */
  drag: number;
  /**
   * Downward acceleration, in pixels per second squared. Negative is
   * buoyancy, so balloons rise (ADR 0039).
   */
  gravity: number;
  /** The longest a balloon lives, in milliseconds. */
  lifetime: number;
}
