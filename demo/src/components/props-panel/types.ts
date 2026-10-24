import type { ReactNode } from 'react';
import type { EffectConfig } from 'react-rewards';
import type { Field, RangeControl, SettingValue } from '@/data/effects';

/** One of a choice's buttons. */
export interface ChoiceOption<V extends string> {
  readonly value: V;
  readonly label: string;
}

export interface ChoiceProps<V extends string> {
  readonly name: string;
  readonly options: readonly ChoiceOption<V>[];
  readonly value: V;
  readonly onChange: (value: V) => void;
}

/** The props of a list's control: colours or emoji. */
export interface ListProps {
  readonly name: string;
  readonly value: readonly string[];
  readonly onChange: (value: readonly string[]) => void;
}

export interface RangeProps {
  readonly name: string;
  readonly control: RangeControl;
  readonly value: number;
  readonly onChange: (value: number) => void;
}

export interface SwitchProps {
  readonly name: string;
  readonly value: boolean;
  readonly onChange: (value: boolean) => void;
}

export interface PropsPanelProps<C extends EffectConfig> {
  readonly fields: readonly Field<C>[];
  readonly onChange: (key: keyof C & string, value: SettingValue) => void;
  readonly onReset: () => void;
}

/** The props of the control for one setting. */
export interface ControlProps<C extends EffectConfig> {
  readonly field: Field<C>;
  readonly onChange: (value: SettingValue) => void;
}

export interface ControlGridProps {
  readonly children: ReactNode;
}
