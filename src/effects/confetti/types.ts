import type { EffectConfig } from '@/core/define-effect';

/** Confetti's settings, in the units of ADR 0024. */
export interface ConfettiConfig extends EffectConfig {
  /** Pieces per burst. */
  count: number;
  /** A piece's width in CSS pixels. Pieces are 5/8 as tall as they are wide. */
  size: number;
  /** One sprite per colour. Each piece picks one at random. */
  colors: readonly string[];
  /** The launch direction in degrees, counter-clockwise from the right. 90 is up. */
  angle: number;
  /** The width of the launch cone around `angle`, in degrees. */
  spread: number;
  /** The average launch speed, in pixels per second. */
  velocity: number;
  /**
   * Air resistance per second. Falling pieces settle at 0.8 to 1.2 times
   * `gravity / drag`.
   */
  drag: number;
  /** Downward acceleration, in pixels per second squared. */
  gravity: number;
  /** The longest a piece lives, in milliseconds. */
  lifetime: number;
}
