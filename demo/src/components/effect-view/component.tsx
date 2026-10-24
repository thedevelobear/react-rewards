import { useId } from 'react';
import type { EffectConfig } from 'react-rewards';
import { CodeBlock } from '@/components/code-block';
import { Preview } from '@/components/preview';
import { PropsPanel } from '@/components/props-panel';
import { PropsTable } from '@/components/props-table';
import { Tabs } from '@/components/tabs';
import { fields, snippet } from '@/data/effects';
import { useConfig } from '@/hooks/use-config';
import type { EffectViewProps } from './types';

/**
 * One effect's Preview and Code tabs (README, "Preview and Code tabs"). The
 * site gives each effect its own instance, so the settings start from the
 * defaults.
 */
export const EffectView = <C extends EffectConfig>({
  page,
}: EffectViewProps<C>) => {
  const { config, set, reset } = useConfig(page.effect);
  const usageHeading = useId();
  const settings = fields(page, config);

  return (
    <Tabs
      label={`${page.label} demo`}
      tabs={[
        {
          id: 'preview',
          label: 'Preview',
          panel: (
            <>
              <Preview page={page} config={config} />
              <PropsPanel fields={settings} onChange={set} onReset={reset} />
              <PropsTable fields={settings} />
            </>
          ),
        },
        {
          id: 'code',
          label: 'Code',
          panel: (
            <section className="section" aria-labelledby={usageHeading}>
              <h2 id={usageHeading} className="section-title">
                Usage
              </h2>
              <CodeBlock
                code={snippet(page, config)}
                filename="RewardButton.tsx"
                label="the snippet"
              />
            </section>
          ),
        },
      ]}
    />
  );
};
