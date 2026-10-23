import { useState } from 'react';

interface EmojisProps {
  readonly name: string;
  readonly value: readonly string[];
  readonly onChange: (value: readonly string[]) => void;
}

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/**
 * `text` split into characters, so an emoji made of several code points
 * stays whole. Whitespace is dropped (README, "Props panel").
 */
const characters = (text: string) =>
  Array.from(segmenter.segment(text), ({ segment }) => segment).filter(
    (segment) => segment.trim() !== ''
  );

/**
 * A chip per emoji, and a field that adds what is typed (README, "Props
 * panel").
 */
export const Emojis = ({ name, value, onChange }: EmojisProps) => {
  const [text, setText] = useState('');

  const remove = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  return (
    <fieldset className="frame-panel props-field props-field-wide">
      <legend className="props-field-name">{name}</legend>
      <div className="props-list">
        {value.map((glyph, index) => (
          // Emoji can repeat, so a chip is known by its position.
          // biome-ignore lint/suspicious/noArrayIndexKey: see above
          <span className="props-chip" key={index}>
            {glyph}
            <button
              type="button"
              className="props-remove"
              aria-label={`Remove ${glyph}`}
              disabled={value.length === 1}
              onClick={() => remove(index)}
            >
              ×
            </button>
          </span>
        ))}
        <form
          className="props-chip-form"
          onSubmit={(event) => {
            event.preventDefault();
            const added = characters(text);
            if (added.length === 0) return;
            onChange([...value, ...added]);
            setText('');
          }}
        >
          <input
            className="props-chip-input"
            aria-label="Emoji to add"
            placeholder="Add emoji"
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
          />
          <button type="submit" className="props-chip-submit" aria-label="Add">
            +
          </button>
        </form>
      </div>
    </fieldset>
  );
};
