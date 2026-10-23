import type { EffectConfig } from 'react-rewards';
import type { AnyEffectPage, EffectPage } from './types';

/** Hides `page`'s config type, so it fits in the list of pages. */
export const effectPage = <C extends EffectConfig>(
  page: EffectPage<C>
): AnyEffectPage => ({
  name: page.effect.name,
  label: page.label,
  description: page.description,
  use: (callback) => callback(page),
});
