import { useCallback, useState } from 'react';
import type { Effect, EffectConfig } from 'react-rewards';
import type { SettingValue } from '@/data/effects';
import type { UseConfigResult } from './types';

/**
 * The props panel's settings for `effect`, starting from its defaults. The
 * site remounts the page when the effect changes, so they reset then.
 */
export const useConfig = <C extends EffectConfig>(
  effect: Effect<C>
): UseConfigResult<C> => {
  const [config, setConfig] = useState<Readonly<C>>(effect.defaults);

  const set = useCallback(
    (key: keyof C & string, value: SettingValue) =>
      setConfig((current) => ({ ...current, [key]: value })),
    []
  );

  const reset = useCallback(
    () => setConfig(effect.defaults),
    [effect.defaults]
  );

  return { config, set, reset };
};
