import type { ReactNode } from 'react';

export interface Tab {
  readonly id: string;
  readonly label: string;
  readonly panel: ReactNode;
}

export interface TabsProps {
  /** What the tab list is for, for screen readers. */
  readonly label: string;
  readonly tabs: readonly Tab[];
}
