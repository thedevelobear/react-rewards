import { type ChangeEvent, type MouseEvent, useRef, useState } from 'react';
import {
  type Burst,
  type BurstEnd,
  balloon,
  confetti,
  type Effect,
  type EffectConfig,
  emoji,
  fire,
  type Origin,
  type RendererPreference,
  setRenderer,
} from 'react-rewards';

type Status = 'idle' | 'running' | BurstEnd;

/** The seed of the burst that plays the same way every time. */
const SEED = 1;

/**
 * A bare page for trying effects by hand and for the browser tests, which
 * find elements by `data-testid` (ADR 0006). PRs 9 to 11 turn it into the
 * preview site.
 */
export const App = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [renderer, setRendererChoice] = useState<RendererPreference>('auto');
  const bursts = useRef(new Set<Burst>());

  const play = <C extends EffectConfig>(
    effect: Effect<C>,
    origin: Origin,
    seed?: number
  ) => {
    const burst = fire(effect, { origin, seed });
    bursts.current.add(burst);
    setStatus('running');
    burst.finished.then((how) => {
      bursts.current.delete(burst);
      // With bursts still running, the page stays 'running'.
      if (bursts.current.size === 0) setStatus(how);
    });
  };

  /** Fires `effect` from the clicked button. */
  const playFrom =
    <C extends EffectConfig>(effect: Effect<C>) =>
    (event: MouseEvent<HTMLButtonElement>) =>
      play(effect, event.currentTarget);

  const playSeeded = (event: MouseEvent<HTMLButtonElement>) =>
    play(confetti, event.currentTarget, SEED);

  const playAtPointer = (event: MouseEvent<HTMLButtonElement>) =>
    // A keyboard click has no pointer position, so it fires from the button.
    play(
      confetti,
      event.detail === 0
        ? event.currentTarget
        : { x: event.clientX, y: event.clientY }
    );

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
        <button
          type="button"
          data-testid="fire-confetti"
          onClick={playFrom(confetti)}
        >
          Confetti
        </button>
        <button
          type="button"
          data-testid="fire-emoji"
          onClick={playFrom(emoji)}
        >
          Emoji
        </button>
        <button
          type="button"
          data-testid="fire-balloon"
          onClick={playFrom(balloon)}
        >
          Balloon
        </button>
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
          <button type="button" data-testid="fire-seeded" onClick={playSeeded}>
            Seeded confetti
          </button>
        </div>
      </section>

      <section>
        <h2>Clipping fixture</h2>
        <p>
          The button sits inside <code>overflow: hidden</code> and a{' '}
          <code>transform</code>. Particles should still fly out of the box.
        </p>
        <div className="clip" data-testid="clip-fixture">
          <button
            type="button"
            data-testid="fire-clipped"
            onClick={playFrom(confetti)}
          >
            Confetti
          </button>
        </div>
      </section>

      <section>
        <h2>From the pointer</h2>
        <button
          type="button"
          className="pad"
          data-testid="fire-at-pointer"
          onClick={playAtPointer}
        >
          Click anywhere here
        </button>
      </section>
    </main>
  );
};
