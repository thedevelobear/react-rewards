interface ChoiceOption<V extends string> {
  readonly value: V;
  readonly label: string;
}

interface ChoiceProps<V extends string> {
  readonly name: string;
  readonly options: readonly ChoiceOption<V>[];
  readonly value: V;
  readonly onChange: (value: V) => void;
}

/** A button per option, such as the stress test's renderers. */
export const Choice = <V extends string>({
  name,
  options,
  value,
  onChange,
}: ChoiceProps<V>) => (
  <fieldset className="frame-panel props-field">
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
