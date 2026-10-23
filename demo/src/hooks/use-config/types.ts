import type { EffectConfig } from 'react-rewards';
import type { SettingValue } from '@/data/effects';

export interface UseConfigResult<C extends EffectConfig> {
  readonly config: Readonly<C>;
  /** Sets one setting. The props panel picks the control by its type. */
  readonly set: (key: keyof C & string, value: SettingValue) => void;
  /** Goes back to the effect's defaults. */
  readonly reset: () => void;
}
