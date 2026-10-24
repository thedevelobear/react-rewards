import type { EffectConfig } from 'react-rewards';
import { CodeText } from '@/components/code-text';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { Section } from '@/components/section';
import { type AnyControl, formatValue } from '@/data/effects';
import type { PropsTableProps } from './types';

const TYPES: Record<AnyControl['kind'], string> = {
  range: 'number',
  switch: 'boolean',
  colors: 'string[]',
  emojis: 'string[]',
};

const COLUMNS: readonly DataTableColumn[] = [
  { label: 'Prop', code: true },
  { label: 'Type', code: true, muted: true },
  { label: 'Default', code: true },
  { label: 'Description', muted: true },
];

/** Every setting of the effect, with its default (README, "Props table"). */
export const PropsTable = <C extends EffectConfig>({
  fields,
}: PropsTableProps<C>) => (
  <Section title="Props">
    <DataTable
      columns={COLUMNS}
      rows={fields.map(({ key, control, defaultValue }) => ({
        key,
        cells: [
          key,
          TYPES[control.kind],
          formatValue(defaultValue),
          <CodeText key="description" text={control.description} />,
        ],
      }))}
    />
  </Section>
);
