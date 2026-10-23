import { useRef } from 'react';
import { type EffectConfig, useReward } from 'react-rewards';
import type { EffectPage } from '@/data/effects';
import './style.css';

interface PreviewProps<C extends EffectConfig> {
  readonly page: EffectPage<C>;
  /** The props panel's settings. */
  readonly config: Readonly<C>;
}

/**
 * The stage for one effect: a dot grid and a button that fires the effect
 * from its centre, with the props panel's settings. There is no replay
 * button (README, "Preview and Code tabs").
 */
export const Preview = <C extends EffectConfig>({
  page,
  config,
}: PreviewProps<C>) => {
  const ref = useRef<HTMLButtonElement>(null);
  const { reward } = useReward(ref, page.effect, config);
  return (
    <div className="preview">
      <button
        ref={ref}
        type="button"
        className="preview-button"
        data-testid="reward"
        onClick={() => reward()}
      >
        Reward me
      </button>
    </div>
  );
};
