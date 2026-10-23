import type { EffectConfig } from 'react-rewards';
import { Preview } from '@/components/preview';
import { PropsPanel } from '@/components/props-panel';
import { type EffectPage, fields } from '@/data/effects';
import { useConfig } from '@/hooks/use-config';

interface EffectViewProps<C extends EffectConfig> {
  readonly page: EffectPage<C>;
}

/**
 * One effect's preview and props panel. The site gives each effect its own
 * instance, so the settings start from the defaults.
 */
export const EffectView = <C extends EffectConfig>({
  page,
}: EffectViewProps<C>) => {
  const { config, set, reset } = useConfig(page.effect);
  return (
    <>
      <Preview page={page} config={config} />
      <PropsPanel
        fields={fields(page, config)}
        onChange={set}
        onReset={reset}
      />
    </>
  );
};
