import type { EffectConfig } from 'react-rewards';
import type { EffectPage } from '@/data/effects';

export interface EffectViewProps<C extends EffectConfig> {
  readonly page: EffectPage<C>;
}
