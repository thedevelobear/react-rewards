import type { Effect, EffectConfig } from 'react-rewards';

/**
 * How the props panel edits one setting, and what the props table says about
 * it (ADR 0054).
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

/** Swatches for a list of colours, or chips for a list of emoji (ADR 0052). */
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
  /** One line under the title. */
  readonly description: string;
  readonly controls: Controls<C>;
}

/**
 * An effect page with its config type hidden, so pages for different effects
 * fit in one list. `Effect<C>` takes `C` in its functions' parameters, so an
 * `Effect<ConfettiConfig>` isn't an `Effect<EffectConfig>` (plan, open
 * question 8). `use` hands the typed page to a generic callback.
 */
export interface AnyEffectPage {
  /** The effect's `name`, which is also its URL hash (ADR 0046). */
  readonly name: string;
  readonly label: string;
  readonly description: string;
  readonly use: <R>(
    callback: <C extends EffectConfig>(page: EffectPage<C>) => R
  ) => R;
}
