import type { ReactNode } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import {
  type AnyControl,
  effects,
  fields,
  formatValue,
  isStringList,
} from '@/data/effects';
import type { Setting, SettingDefault } from './types';

/**
 * Every setting of the effects, in the order their pages list them, with
 * each effect's default.
 */
const settings = (): readonly Setting[] => {
  const byKey = new Map<string, Setting>();
  for (const page of effects) {
    const defaults = page.use((typed): readonly SettingDefault[] =>
      fields(typed, typed.effect.defaults)
    );
    for (const { key, control, defaultValue } of defaults) {
      const setting = byKey.get(key) ?? { key, control, defaults: new Map() };
      setting.defaults.set(page.name, defaultValue);
      byKey.set(key, setting);
    }
  }
  return [...byKey.values()];
};

const SETTINGS = settings();

const COLUMNS: readonly DataTableColumn[] = [
  { label: 'Setting', code: true },
  { label: 'Unit', code: true, muted: true },
  ...effects.map(({ label }) => ({ label, code: true })),
];

/** A default as the props table writes it. Colours are counted. */
const shown = (control: AnyControl, value: unknown): ReactNode => {
  if (value === undefined) return '';
  if (control.kind === 'colors' && isStringList(value)) {
    return `${value.length} colours`;
  }
  return formatValue(value);
};

/**
 * Each effect's defaults side by side, from the effects' pages, so they
 * can't drift from the library (README, "Articles").
 */
export const SettingsTable = () => (
  <DataTable
    columns={COLUMNS}
    rows={SETTINGS.map(({ key, control, defaults }) => ({
      key,
      cells: [
        key,
        control.kind === 'range' ? (control.unit ?? '') : '',
        ...effects.map(({ name }) => shown(control, defaults.get(name))),
      ],
    }))}
  />
);
