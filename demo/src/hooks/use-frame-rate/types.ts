import type { Burst, RendererKind } from 'react-rewards';

/** What the stress test's readout shows (README, "Stress test"). */
export type Reading =
  | { readonly state: 'ready' }
  | {
      readonly state: 'running';
      /** The renderer of the latest burst that got one (ADR 0047). */
      readonly renderer: RendererKind | undefined;
      /** Frames a second over the last half second. */
      readonly fps: number | undefined;
    }
  | {
      readonly state: 'done';
      readonly renderer: RendererKind | undefined;
      /** Frames a second over the whole run. */
      readonly fps: number | undefined;
    }
  | { readonly state: 'skipped' };

export interface UseFrameRateResult {
  readonly reading: Reading;
  /**
   * Counts frames from now until `burst` ends, along with any other burst
   * tracked while it runs.
   */
  readonly track: (burst: Burst) => void;
}

/** One run: from the first tracked burst until every tracked burst ends. */
export interface Run {
  readonly bursts: Set<Burst>;
  renderer: RendererKind | undefined;
  /** Whether any burst ended other than skipped. */
  drew: boolean;
  /** Frame times within the last half second. */
  readonly recent: number[];
  first: number | undefined;
  last: number;
  frames: number;
  shown: number;
  handle: number;
}
