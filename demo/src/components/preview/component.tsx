import { type ReactNode, useRef } from 'react';
import { type Burst, type EffectConfig, useReward } from 'react-rewards';
import type { EffectPage } from '@/data/effects';
import './style.css';

interface PreviewProps<C extends EffectConfig> {
  readonly page: EffectPage<C>;
  /** The props panel's settings. */
  readonly config: Readonly<C>;
  /** Called with each burst the button starts. */
  readonly onBurst?: (burst: Burst) => void;
  /** Shown over the stage, such as the stress test's readout. */
  readonly children?: ReactNode;
}

/**
 * The stage for one effect: a dot grid and a button that fires the effect
 * from its centre, with the props panel's settings. There is no replay
 * button (README, "Preview and Code tabs").
 */
export const Preview = <C extends EffectConfig>({
  page,
  config,
  onBurst,
  children,
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
        onClick={() => {
          // Not `onBurst?.(reward())`, which skips `reward()` without one.
          const burst = reward();
          onBurst?.(burst);
        }}
      >
        Reward me
      </button>
      {children}
    </div>
  );
};
