import type { Effect, EffectConfig } from 'react-rewards';

/** What the site shows for one effect. */
export interface EffectPage<C extends EffectConfig> {
  readonly effect: Effect<C>;
  /** The sidebar label and the page title. */
  readonly label: string;
  /** One line under the title. */
  readonly description: string;
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
