import type { EffectConfig } from 'react-rewards';
import type { AnyEffectPage, EffectPage, Field } from './types';

/** Hides `page`'s config type, so it fits in the list of pages. */
export const effectPage = <C extends EffectConfig>(
  page: EffectPage<C>
): AnyEffectPage => ({
  name: page.effect.name,
  label: page.label,
  description: page.description,
  icon: page.icon,
  use: (callback) => callback(page),
});

/** The page's settings in the order of its controls, with their values. */
export const fields = <C extends EffectConfig>(
  page: EffectPage<C>,
  config: Readonly<C>
): readonly Field<C>[] =>
  // `Controls<C>` has a key for every field of `C`, and no others.
  (Object.keys(page.controls) as (keyof C & string)[]).map((key) => ({
    key,
    control: page.controls[key],
    value: config[key],
    defaultValue: page.effect.defaults[key],
  }));

/** Whether two setting values are the same. Lists compare item by item. */
export const sameValue = (a: unknown, b: unknown): boolean =>
  Array.isArray(a) && Array.isArray(b)
    ? a.length === b.length && a.every((item, index) => item === b[index])
    : a === b;

/** Whether `value` is a list of strings, such as `colors`. */
export const isStringList = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

/** `text` as a single-quoted string literal. */
export const quote = (text: string): string =>
  `'${text.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;

/** `value` as TypeScript source, for the snippet and the props table. */
export const formatValue = (value: unknown): string =>
  isStringList(value) ? `[${value.map(quote).join(', ')}]` : String(value);
