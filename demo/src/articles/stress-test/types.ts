import type { Reading } from '@/hooks/use-frame-rate';

export interface ReadoutProps {
  readonly reading: Reading;
}

/**
 * What an effect's `count` counts, for an effect whose `count` isn't
 * particles (README, "Stress test").
 */
export interface CountUnit {
  /** About how many particles one makes at its busiest, at the defaults. */
  readonly particles: number;
  /** Its name, for one and for several. */
  readonly one: string;
  readonly many: string;
}
