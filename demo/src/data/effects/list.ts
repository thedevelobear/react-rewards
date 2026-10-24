import { balloonPage } from './balloon';
import { confettiPage } from './confetti';
import { emojiPage } from './emoji';
import type { AnyEffectPage } from './types';

/** The effects in sidebar order. A new effect adds its page here. */
export const effects = [confettiPage, emojiPage, balloonPage] as const;

/** The page for `name`, if there is one (README, "Routing"). */
export const findEffect = (name: string): AnyEffectPage | undefined =>
  effects.find((page) => page.name === name);
