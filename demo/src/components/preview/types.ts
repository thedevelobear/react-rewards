import type { ReactNode } from 'react';
import type { Burst, EffectConfig } from 'react-rewards';
import type { EffectPage } from '@/data/effects';

export interface PreviewProps<C extends EffectConfig> {
  readonly page: EffectPage<C>;
  /** The props panel's settings. */
  readonly config: Readonly<C>;
  /** Called with each burst the button starts. */
  readonly onBurst?: (burst: Burst) => void;
  /** Shown in the top right corner, such as the stress test's readout. */
  readonly corner?: ReactNode;
  /** A line under the button. */
  readonly caption?: ReactNode;
}
