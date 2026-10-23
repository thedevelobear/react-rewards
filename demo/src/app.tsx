import { type ChangeEvent, type ReactNode, useRef, useState } from 'react';
import {
  type Burst,
  type BurstEnd,
  balloon,
  confetti,
  type Effect,
  type EffectConfig,
  emoji,
  type RendererPreference,
  type RewardOptions,
  setRenderer,
  useReward,
} from 'react-rewards';

type Status = 'idle' | 'running' | BurstEnd;

/** The seed of the burst that plays the same way every time. */
const SEED = 1;

interface RewardButtonProps<C extends EffectConfig> {
  readonly effect: Effect<C>;
  readonly options?: RewardOptions;
  readonly testId: string;
  readonly className?: string;
  /**
   * Passes the click to `reward`, so the burst starts at the pointer, or at
   * the button for a keyboard click (ADR 0044). Without it, the burst starts
   * at the button.
   */
  readonly atPointer?: boolean;
  /** Called with each burst the button starts. */
  readonly onBurst: (burst: Burst) => void;
  readonly children: ReactNode;
}

/**
 * A button that plays `effect` through `useReward`. `data-animating` shows
 * the hook's `isAnimating`.
 */
const RewardButton = <C extends EffectConfig>({
  effect,
  options,
  testId,
  className,
  atPointer = false,
  onBurst,
  children,
}: RewardButtonProps<C>) => {
  const ref = useRef<HTMLButtonElement>(null);
  const { reward, isAnimating } = useReward(ref, effect, undefined, options);
  return (
    <button
      ref={ref}
      type="button"
      className={className}
      data-testid={testId}
      data-animating={isAnimating}
      onClick={(event) => onBurst(atPointer ? reward(event) : reward())}
    >
      {children}
    </button>
  );
};

/**
 * A bare page for trying effects by hand and for the browser tests, which
 * find elements by `data-testid` (ADR 0006). PRs 9 to 11 turn it into the
 * preview site.
 */
export const App = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [renderer, setRendererChoice] = useState<RendererPreference>('auto');
  const [mounted, setMounted] = useState(true);
  const bursts = useRef(new Set<Burst>());

  /** Shows the page's bursts in the status output. */
  const track = (burst: Burst) => {
    bursts.current.add(burst);
    setStatus('running');
    burst.finished.then((how) => {
      bursts.current.delete(burst);
      // With bursts still running, the page stays 'running'.
      if (bursts.current.size === 0) setStatus(how);
    });
  };

  const cancelAll = () => {
    for (const burst of bursts.current) burst.cancel();
  };

  const chooseRenderer = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.currentTarget.value as RendererPreference;
    setRenderer(next);
    setRendererChoice(next);
  };

  return (
    <main>
      <h1>react-rewards</h1>
      <section className="row">
        <RewardButton effect={confetti} testId="fire-confetti" onBurst={track}>
          Confetti
        </RewardButton>
        <RewardButton effect={emoji} testId="fire-emoji" onBurst={track}>
          Emoji
        </RewardButton>
        <RewardButton effect={balloon} testId="fire-balloon" onBurst={track}>
          Balloon
        </RewardButton>
        <button type="button" data-testid="cancel-all" onClick={cancelAll}>
          Cancel all
        </button>
        <output data-testid="status">{status}</output>
      </section>

      <section>
        <h2>Renderer</h2>
        <p>
          The choice applies from the next burst. A forced renderer that the
          browser can't provide skips the burst. The seeded burst plays the same
          way every time, so the renderers can be compared.
        </p>
        <div className="row">
          <label>
            Renderer{' '}
            <select
              data-testid="renderer"
              value={renderer}
              onChange={chooseRenderer}
            >
              <option value="auto">Auto</option>
              <option value="webgl">WebGL2</option>
              <option value="canvas">Canvas 2D</option>
            </select>
          </label>
          <RewardButton
            effect={confetti}
            options={{ seed: SEED }}
            testId="fire-seeded"
            onBurst={track}
          >
            Seeded confetti
          </RewardButton>
        </div>
      </section>

      <section>
        <h2>Clipping fixture</h2>
        <p>
          The button sits inside <code>overflow: hidden</code> and a{' '}
          <code>transform</code>. Particles should still fly out of the box.
        </p>
        <div className="clip" data-testid="clip-fixture">
          <RewardButton effect={confetti} testId="fire-clipped" onBurst={track}>
            Confetti
          </RewardButton>
        </div>
      </section>

      <section>
        <h2>Unmounting</h2>
        <p>
          Unmounting the button cancels the bursts it started, so they stop at
          once.
        </p>
        <div className="row">
          {mounted && (
            <RewardButton
              effect={confetti}
              testId="fire-unmountable"
              onBurst={track}
            >
              Confetti
            </RewardButton>
          )}
          <button
            type="button"
            data-testid="toggle-mounted"
            onClick={() => setMounted(!mounted)}
          >
            {mounted ? 'Unmount' : 'Mount'}
          </button>
        </div>
      </section>

      <section>
        <h2>From the pointer</h2>
        <RewardButton
          effect={confetti}
          atPointer
          className="pad"
          testId="fire-at-pointer"
          onBurst={track}
        >
          Click anywhere here
        </RewardButton>
      </section>
    </main>
  );
};
