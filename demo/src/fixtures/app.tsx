import { type ChangeEvent, useRef, useState } from 'react';
import {
  type Burst,
  balloon,
  confetti,
  type EffectConfig,
  emoji,
  type RendererKind,
  type RendererPreference,
  setRenderer,
  useReward,
} from 'react-rewards';
import type { RewardButtonProps, Status } from './types';

/** The seed of the burst that plays the same way every time. */
const SEED = 1;

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
 * find elements by `data-testid` (ADR 0006). It is served as
 * `fixtures.html`, apart from the preview site (ADR 0045).
 */
export const App = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [renderer, setRendererChoice] = useState<RendererPreference>('auto');
  /** The renderer the last burst was given (ADR 0047). */
  const [given, setGiven] = useState<RendererKind | 'none'>('none');
  const [mounted, setMounted] = useState(true);
  const bursts = useRef(new Set<Burst>());

  /** Shows the page's bursts in the status output. */
  const track = (burst: Burst) => {
    bursts.current.add(burst);
    setStatus('running');
    setGiven(burst.renderer ?? 'none');
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
          <span>
            Last burst: <output data-testid="renderer-given">{given}</output>
          </span>
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
