import type { Effect, EffectConfig } from 'react-rewards';
import type { IconName } from '@/components/icon';

/**
 * How the props panel edits one setting, and what the props table says about
 * it (README, "Props table").
 */
interface BaseControl {
  /** The field's JSDoc from the effect's `types.ts`. */
  readonly description: string;
}

/** A slider for a number. */
export interface RangeControl extends BaseControl {
  readonly kind: 'range';
  readonly min: number;
  readonly max: number;
  readonly step: number;
  /** Shown after the value, such as `px` or `ms`. */
  readonly unit?: string;
}

/** A switch for a boolean. */
export interface SwitchControl extends BaseControl {
  readonly kind: 'switch';
}

/**
 * Swatches for a list of colours, or chips for a list of emoji (README,
 * "Props panel").
 */
export interface ListControl extends BaseControl {
  readonly kind: 'colors' | 'emojis';
}

/** Any control, with the type of its value hidden. */
export type AnyControl = RangeControl | SwitchControl | ListControl;

/** The control for a value of type `V`. */
export type Control<V> = [V] extends [number]
  ? RangeControl
  : [V] extends [boolean]
    ? SwitchControl
    : [V] extends [readonly string[]]
      ? ListControl
      : never;

/** A control for every field of `C`, in the order the panel shows them. */
export type Controls<C extends EffectConfig> = {
  readonly [K in keyof C]-?: Control<C[K]>;
};

/** A value the props panel can set. */
export type SettingValue = number | boolean | readonly string[];

/** What the site shows for one effect. */
export interface EffectPage<C extends EffectConfig> {
  readonly effect: Effect<C>;
  /** The sidebar label and the page title. */
  readonly label: string;
  /** One line under the title, and on the effect's card. */
  readonly description: string;
  /** The sidebar icon. The preview's button and the card show it too. */
  readonly icon: IconName;
  readonly controls: Controls<C>;
}

/**
 * An effect page with its config type hidden, so pages for different effects
 * fit in one list. `use` hands the typed page to a generic callback, so the
 * shared components still see the page's own config type, and every key the
 * props panel sets is one of its fields.
 */
export interface AnyEffectPage {
  /** The effect's `name`, which is also its URL hash (README, "Routing"). */
  readonly name: string;
  readonly label: string;
  readonly description: string;
  readonly icon: IconName;
  readonly use: <R>(
    callback: <C extends EffectConfig>(page: EffectPage<C>) => R
  ) => R;
}
