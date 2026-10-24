import type { ChoiceProps } from './types';

/** A button per option, such as the stress test's renderers. */
export const Choice = <V extends string>({
  name,
  options,
  value,
  onChange,
}: ChoiceProps<V>) => (
  <fieldset className="props-field">
    <legend className="props-field-name">{name}</legend>
    <div className="props-choice">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="props-choice-option"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  </fieldset>
);
