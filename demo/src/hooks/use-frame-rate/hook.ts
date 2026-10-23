import { useCallback, useEffect, useRef, useState } from 'react';
import type { Burst, RendererKind } from 'react-rewards';
import type { Reading, UseFrameRateResult } from './types';

/** How far back the running fps looks, in ms. */
const WINDOW = 500;

/**
 * How often the running fps is shown, in ms, so the page doesn't render
 * every frame.
 */
const REFRESH = 250;

/** One run: from the first tracked burst until every tracked burst ends. */
interface Run {
  readonly bursts: Set<Burst>;
  renderer: RendererKind | undefined;
  /** Whether any burst ended other than skipped. */
  drew: boolean;
  /** Frame times within the last `WINDOW`. */
  readonly recent: number[];
  first: number | undefined;
  last: number;
  frames: number;
  shown: number;
  handle: number;
}

/** Frames a second, from `frames` frames between `first` and `last`. */
const rate = (frames: number, first = 0, last = 0): number | undefined =>
  frames > 1 && last > first
    ? ((frames - 1) / (last - first)) * 1000
    : undefined;

/**
 * Counts `requestAnimationFrame` callbacks while bursts run, for the stress
 * test's readout (README, "Stress test"). Nothing runs between bursts.
 */
export const useFrameRate = (): UseFrameRateResult => {
  const [reading, setReading] = useState<Reading>({ state: 'ready' });
  const current = useRef<Run | undefined>(undefined);

  useEffect(
    () => () => {
      if (current.current) cancelAnimationFrame(current.current.handle);
      current.current = undefined;
    },
    []
  );

  const start = useCallback((): Run => {
    const run: Run = {
      bursts: new Set(),
      renderer: undefined,
      drew: false,
      recent: [],
      first: undefined,
      last: 0,
      frames: 0,
      shown: Number.NEGATIVE_INFINITY,
      handle: 0,
    };
    const frame = (time: number) => {
      run.handle = requestAnimationFrame(frame);
      run.first ??= time;
      run.last = time;
      run.frames += 1;
      run.recent.push(time);
      while ((run.recent[0] ?? time) < time - WINDOW) run.recent.shift();
      if (time - run.shown < REFRESH) return;
      run.shown = time;
      setReading({
        state: 'running',
        renderer: run.renderer,
        fps: rate(run.recent.length, run.recent[0], time),
      });
    };
    run.handle = requestAnimationFrame(frame);
    return run;
  }, []);

  const track = useCallback(
    (burst: Burst) => {
      current.current ??= start();
      const run = current.current;
      run.bursts.add(burst);
      run.renderer = burst.renderer ?? run.renderer;
      setReading({ state: 'running', renderer: run.renderer, fps: undefined });
      burst.finished.then((how) => {
        // Unmounted, so nothing is shown.
        if (current.current !== run) return;
        run.bursts.delete(burst);
        if (how !== 'skipped') run.drew = true;
        if (run.bursts.size > 0) return;
        cancelAnimationFrame(run.handle);
        current.current = undefined;
        setReading(
          run.drew
            ? {
                state: 'done',
                renderer: run.renderer,
                fps: rate(run.frames, run.first, run.last),
              }
            : { state: 'skipped' }
        );
      });
    },
    [start]
  );

  return { reading, track };
};
