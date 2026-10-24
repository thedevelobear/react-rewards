import type { EffectConfig } from '@/core/define-effect';

/** Emoji's settings, in the units of ADR 0024. */
export interface EmojiConfig extends EffectConfig {
  /** Emoji per burst. */
  count: number;
  /** The font size in CSS pixels. Each emoji is drawn at 0.9 to 1.1 times it. */
  size: number;
  /** One sprite per emoji. Particles take them in turn. */
  emojis: readonly string[];
  /** The launch direction in degrees, counter-clockwise from the right. 90 is up. */
  angle: number;
  /** The width of the launch cone around `angle`, in degrees. */
  spread: number;
  /** The average launch speed, in pixels per second. */
  velocity: number;
  /** Air resistance per second. Falling emoji settle at `gravity / drag`. */
  drag: number;
  /** Downward acceleration, in pixels per second squared. */
  gravity: number;
  /** The longest an emoji lives, in milliseconds. */
  lifetime: number;
  /** Whether emoji start a little tilted and spin. Off keeps them upright. */
  rotate: boolean;
}
