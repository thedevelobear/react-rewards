import { type MouseEvent, useRef, useState } from 'react';
import {
  type Burst,
  type BurstEnd,
  confetti,
  fire,
  type Origin,
} from 'react-rewards';

type Status = 'idle' | 'running' | BurstEnd;

/**
 * A bare page for trying effects by hand and for the browser tests, which
 * find elements by `data-testid` (ADR 0006). PRs 9 to 11 turn it into the
 * preview site.
 */
export const App = () => {
  const [status, setStatus] = useState<Status>('idle');
  const bursts = useRef(new Set<Burst>());

  const play = (origin: Origin) => {
    const burst = fire(confetti, { origin });
    bursts.current.add(burst);
    setStatus('running');
    burst.finished.then((how) => {
      bursts.current.delete(burst);
      // With bursts still running, the page stays 'running'.
      if (bursts.current.size === 0) setStatus(how);
    });
  };

  const playFromTarget = (event: MouseEvent<HTMLButtonElement>) =>
    play(event.currentTarget);

  const playAtPointer = (event: MouseEvent<HTMLButtonElement>) =>
    // A keyboard click has no pointer position, so it fires from the button.
    play(
      event.detail === 0
        ? event.currentTarget
        : { x: event.clientX, y: event.clientY }
    );

  const cancelAll = () => {
    for (const burst of bursts.current) burst.cancel();
  };

  return (
    <main>
      <h1>react-rewards</h1>
      <section className="row">
        <button
          type="button"
          data-testid="fire-confetti"
          onClick={playFromTarget}
        >
          Confetti
        </button>
        <button type="button" data-testid="cancel-all" onClick={cancelAll}>
          Cancel all
        </button>
        <output data-testid="status">{status}</output>
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
            onClick={playFromTarget}
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
