import type { EffectConfig } from 'react-rewards';
import type { Field } from '@/data/effects';

export interface PropsTableProps<C extends EffectConfig> {
  readonly fields: readonly Field<C>[];
}
