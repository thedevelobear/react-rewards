import { useRef } from 'react';
import { type EffectConfig, useReward } from 'react-rewards';
import { Icon } from '@/components/icon';
import type { PreviewProps } from './types';
import './style.css';

/**
 * The stage for one effect: a dot grid, its name, and a button that fires
 * the effect from its centre, with the props panel's settings. The button is
 * a pill, or a circle with only the icon, as the page says. There is no
 * replay button (README, "Preview").
 */
export const Preview = <C extends EffectConfig>({
  page,
  config,
  onBurst,
  corner,
  caption,
}: PreviewProps<C>) => {
  const ref = useRef<HTMLButtonElement>(null);
  const { reward } = useReward(ref, page.effect, config);
  const iconOnly = page.button === 'icon';
  return (
    <div className="preview">
      <div className="preview-bar">
        <p className="preview-label">Live preview · {page.effect.name}</p>
        {corner}
      </div>
      <button
        ref={ref}
        type="button"
        className={
          iconOnly ? 'preview-button preview-button-icon' : 'preview-button'
        }
        // With no text, the name is the pill's label.
        aria-label={iconOnly ? 'Reward me' : undefined}
        data-testid="reward"
        onClick={() => {
          // Not `onBurst?.(reward())`, which skips `reward()` without one.
          const burst = reward();
          onBurst?.(burst);
        }}
      >
        <Icon
          name={page.icon}
          size={iconOnly ? 24 : undefined}
          strokeWidth={iconOnly ? 2 : 2.2}
        />
        {!iconOnly && 'Reward me'}
      </button>
      {caption && <p className="preview-caption">{caption}</p>}
    </div>
  );
};
