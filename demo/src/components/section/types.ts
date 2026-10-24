import type { ReactNode } from 'react';

export interface SectionProps {
  readonly title: string;
  /** Shown at the end of the title's line, such as the props panel's Reset. */
  readonly action?: ReactNode;
  readonly children: ReactNode;
}
