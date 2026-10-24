import type { ReactNode } from 'react';
import type { IconName } from '@/components/icon';

/** A colour of the drawings: a token in `tokens.css`. */
export type Paint =
  | 'accent'
  | 'art-violet'
  | 'art-amber'
  | 'art-sky'
  | 'art-mint';

/** A confetti piece: where it sits in the card, in %, and its shape. */
export interface Piece {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly paint: Paint;
  readonly round?: boolean;
  readonly turn?: number;
}

/** A face's parts, turned and placed at `x` and `y`. */
export interface FaceProps {
  readonly x: number;
  readonly y: number;
  readonly turn: number;
  readonly children: ReactNode;
}

/** A balloon at `x`, its top at `y`. */
export interface BalloonProps {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly paint: Paint;
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
