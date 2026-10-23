import type { EffectConfig } from 'react-rewards';
import { Preview } from '@/components/preview';
import { PropsPanel } from '@/components/props-panel';
import { PropsTable } from '@/components/props-table';
import { type EffectPage, fields } from '@/data/effects';
import { useConfig } from '@/hooks/use-config';

interface EffectViewProps<C extends EffectConfig> {
  readonly page: EffectPage<C>;
}

/**
 * One effect's preview, props panel and props table. The site gives each
 * effect its own instance, so the settings start from the defaults.
 */
export const EffectView = <C extends EffectConfig>({
  page,
}: EffectViewProps<C>) => {
  const { config, set, reset } = useConfig(page.effect);
  const settings = fields(page, config);
  return (
    <>
      <Preview page={page} config={config} />
      <PropsPanel fields={settings} onChange={set} onReset={reset} />
      <PropsTable fields={settings} />
    </>
  );
};
