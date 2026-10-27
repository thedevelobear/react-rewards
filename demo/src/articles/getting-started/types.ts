import type { ReactNode } from 'react';

/** A colour of the effect cards' icons: a token in `tokens.css`. */
export type Paint = 'accent' | 'art-violet' | 'art-amber' | 'art-sky';

/** A numbered step of the page. */
export interface StepProps {
  readonly number: number;
  readonly title: string;
  readonly text: ReactNode;
  readonly children: ReactNode;
}
