import { useId } from 'react';
import type { EffectConfig } from 'react-rewards';
import { isStringList, sameValue } from '@/data/effects';
import { Colors } from './colors';
import { Emojis } from './emojis';
import { Range } from './range';
import { Switch } from './switch';
import type { ControlGridProps, ControlProps, PropsPanelProps } from './types';
import './style.css';

/** The control for one setting, picked by its kind and its value's type. */
const Control = <C extends EffectConfig>({
  field: { key, control, value },
  onChange,
}: ControlProps<C>) => {
  switch (control.kind) {
    case 'range':
      return typeof value === 'number' ? (
        <Range name={key} control={control} value={value} onChange={onChange} />
      ) : null;
    case 'switch':
      return typeof value === 'boolean' ? (
        <Switch name={key} value={value} onChange={onChange} />
      ) : null;
    case 'colors':
      return isStringList(value) ? (
        <Colors name={key} value={value} onChange={onChange} />
      ) : null;
    case 'emojis':
      return isStringList(value) ? (
        <Emojis name={key} value={value} onChange={onChange} />
      ) : null;
  }
};

/** The panel's grid of cells, one per control. */
export const ControlGrid = ({ children }: ControlGridProps) => (
  <div className="props-panel">
    <div className="props-grid">{children}</div>
  </div>
);

/**
 * A control per setting, generated from the effect's controls, so a new
 * effect needs no panel code (README, "Props panel").
 */
export const PropsPanel = <C extends EffectConfig>({
  fields,
  onChange,
  onReset,
}: PropsPanelProps<C>) => {
  const heading = useId();
  const changed = fields.some(
    ({ value, defaultValue }) => !sameValue(value, defaultValue)
  );
  return (
    <section className="section" aria-labelledby={heading}>
      <div className="section-head">
        <h2 id={heading} className="section-title">
          Customize
        </h2>
        <button
          type="button"
          className="props-reset"
          disabled={!changed}
          onClick={onReset}
        >
          Reset
        </button>
      </div>
      <ControlGrid>
        {fields.map((field) => (
          <Control
            key={field.key}
            field={field}
            onChange={(value) => onChange(field.key, value)}
          />
        ))}
      </ControlGrid>
    </section>
  );
};
