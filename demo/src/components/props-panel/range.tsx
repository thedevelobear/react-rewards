import { useId } from 'react';
import type { RangeControl } from '@/data/effects';

interface RangeProps {
  readonly name: string;
  readonly control: RangeControl;
  readonly value: number;
  readonly onChange: (value: number) => void;
}

/** A slider, with the setting's name and value above it. */
export const Range = ({ name, control, value, onChange }: RangeProps) => {
  const id = useId();
  const filled = ((value - control.min) / (control.max - control.min)) * 100;
  return (
    <div className="props-field">
      <div className="props-field-head">
        <label className="props-field-name" htmlFor={id}>
          {name}
        </label>
        <output className="props-field-value" htmlFor={id}>
          {value}
          {control.unit && (
            <span className="props-field-unit">{control.unit}</span>
          )}
        </output>
      </div>
      <input
        id={id}
        className="props-range"
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={value}
        // The first background layer is the filled part of the track.
        style={{ backgroundSize: `${filled}% 4px, 100% 4px` }}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
      />
    </div>
  );
};
