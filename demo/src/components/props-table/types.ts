import type { EffectConfig } from 'react-rewards';
import type { Field } from '@/data/effects';

export interface PropsTableProps<C extends EffectConfig> {
  readonly fields: readonly Field<C>[];
}

export interface DescriptionProps {
  /** A field's JSDoc, with code in backticks. */
  readonly text: string;
}
