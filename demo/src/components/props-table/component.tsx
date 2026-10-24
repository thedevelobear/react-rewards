import { useId } from 'react';
import type { EffectConfig } from 'react-rewards';
import { type AnyControl, formatValue } from '@/data/effects';
import type { DescriptionProps, PropsTableProps } from './types';
import './style.css';

const TYPES: Record<AnyControl['kind'], string> = {
  range: 'number',
  switch: 'boolean',
  colors: 'string[]',
  emojis: 'string[]',
};

/** `text` with its backticked parts as code. */
const Description = ({ text }: DescriptionProps) =>
  text
    .split('`')
    .map((part, index) =>
      index % 2 === 1 ? <code key={part}>{part}</code> : part
    );

/** Every setting of the effect, with its default (README, "Props table"). */
export const PropsTable = <C extends EffectConfig>({
  fields,
}: PropsTableProps<C>) => {
  const heading = useId();
  return (
    <section className="section" aria-labelledby={heading}>
      <h2 id={heading} className="section-title">
        Props
      </h2>
      <div className="props-table-frame">
        <table className="props-table">
          <thead>
            <tr>
              <th scope="col">Prop</th>
              <th scope="col">Type</th>
              <th scope="col">Default</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {fields.map(({ key, control, defaultValue }) => (
              <tr key={key}>
                <th scope="row" className="props-table-code">
                  {key}
                </th>
                <td className="props-table-code props-table-muted">
                  {TYPES[control.kind]}
                </td>
                <td className="props-table-code">
                  {formatValue(defaultValue)}
                </td>
                <td className="props-table-muted">
                  <Description text={control.description} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
