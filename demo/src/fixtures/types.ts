import type { ReactNode } from 'react';
import type {
  Burst,
  BurstEnd,
  Effect,
  EffectConfig,
  RewardOptions,
} from 'react-rewards';

/** What the status output shows. */
export type Status = 'idle' | 'running' | BurstEnd;

export interface RewardButtonProps<C extends EffectConfig> {
  readonly effect: Effect<C>;
  readonly options?: RewardOptions;
  readonly testId: string;
  readonly className?: string;
  /**
   * Passes the click to `reward`, so the burst starts at the pointer, or at
   * the button for a keyboard click (ADR 0044). Without it, the burst starts
   * at the button.
   */
  readonly atPointer?: boolean;
  /** Called with each burst the button starts. */
  readonly onBurst: (burst: Burst) => void;
  readonly children: ReactNode;
}
