import type { SwitchProps } from './types';

/** A checkbox drawn as a switch, with the setting's name beside it. */
export const Switch = ({ name, value, onChange }: SwitchProps) => (
  <label className="props-field props-switch">
    <span className="props-field-name">{name}</span>
    <input
      className="props-switch-input"
      type="checkbox"
      role="switch"
      checked={value}
      aria-checked={value}
      onChange={(event) => onChange(event.currentTarget.checked)}
    />
  </label>
);
