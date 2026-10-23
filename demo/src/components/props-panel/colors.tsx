import { useEffect, useRef } from 'react';

interface ColorsProps {
  readonly name: string;
  readonly value: readonly string[];
  readonly onChange: (value: readonly string[]) => void;
}

/**
 * A swatch per colour, each the browser's colour input, and a + tile that
 * adds one (README, "Props panel").
 */
export const Colors = ({ name, value, onChange }: ColorsProps) => {
  const adder = useRef<HTMLInputElement>(null);

  // React's `onChange` fires on every `input` event while the picker is
  // open. The + tile adds its colour once, on `change`, when it closes.
  useEffect(() => {
    const input = adder.current;
    if (!input) return;
    const add = () => onChange([...value, input.value]);
    input.addEventListener('change', add);
    return () => input.removeEventListener('change', add);
  }, [value, onChange]);

  const replace = (index: number, color: string) =>
    onChange(value.map((current, i) => (i === index ? color : current)));
  const remove = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  return (
    <fieldset className="frame-panel props-field props-field-wide">
      <legend className="props-field-name">{name}</legend>
      <div className="props-list">
        {value.map((color, index) => (
          // Colours can repeat, so a swatch is known by its position.
          // biome-ignore lint/suspicious/noArrayIndexKey: see above
          <div className="props-swatch" key={index}>
            <input
              className="props-swatch-input"
              type="color"
              aria-label={`Colour ${index + 1}`}
              value={color}
              onChange={(event) => replace(index, event.currentTarget.value)}
            />
            <button
              type="button"
              className="props-remove"
              aria-label={`Remove colour ${index + 1}`}
              disabled={value.length === 1}
              onClick={() => remove(index)}
            >
              ×
            </button>
          </div>
        ))}
        <div className="props-swatch props-add">
          <span aria-hidden="true">+</span>
          <input
            ref={adder}
            className="props-swatch-input"
            type="color"
            aria-label="Add a colour"
            defaultValue={value.at(-1)}
          />
        </div>
      </div>
    </fieldset>
  );
};
