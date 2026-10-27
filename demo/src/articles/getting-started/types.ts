import type { ReactNode } from 'react';
import type { IconName } from '@/components/icon';

/** A colour of the drawings: a token in `tokens.css`. */
export type Paint =
  | 'accent'
  | 'art-violet'
  | 'art-amber'
  | 'art-sky'
  | 'art-mint'
  | 'art-line';

/** A stroke of a card's drawing: path data on a 24 px grid, and its colour. */
export interface Stroke {
  readonly d: string;
  readonly paint: Paint;
}

export interface DrawingProps {
  readonly strokes: readonly Stroke[];
}

export interface EffectArtProps {
  /** The effect's `name`, which picks its drawing. */
  readonly name: string;
  /** Shown when the effect has no drawing. */
  readonly icon: IconName;
}

/** A numbered step of the page. */
export interface StepProps {
  readonly number: number;
  readonly title: string;
  readonly text: ReactNode;
  readonly children: ReactNode;
}
