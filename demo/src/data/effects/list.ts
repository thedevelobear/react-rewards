import { balloonPage } from './balloon';
import { confettiPage } from './confetti';
import { emojiPage } from './emoji';
import type { AnyEffectPage } from './types';

/** The effects in sidebar order. A new effect adds its page here. */
export const effects = [confettiPage, emojiPage, balloonPage] as const;

/** The page for `name`, or the first page if there is none (ADR 0046). */
export const findEffect = (name: string): AnyEffectPage =>
  effects.find((page) => page.name === name) ?? effects[0];
