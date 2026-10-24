import type { Atlas } from '@/core/atlas';
import type { Effect, EffectConfig } from '@/core/define-effect';
import type { Loop } from '@/core/loop';
import type { Origin } from '@/core/origin';
import type { Batch, Overlay, Renderer, RendererKind } from '@/core/renderer';
import type { Simulation } from '@/core/simulation';

/**
 * How a burst ended. `'skipped'` means it ended before its simulation
 * started, so nothing was drawn (ADR 0025).
 */
export type BurstEnd = 'complete' | 'skipped' | 'cancelled';

/** One burst's options. The effect's own settings go in `config` (ADR 0023). */
export interface FireOptions<C extends EffectConfig = EffectConfig> {
  /**
   * Where the burst starts: a point in viewport CSS pixels, an element or a
   * ref. It is resolved when `fire()` is called.
   */
  readonly origin: Origin;
  /** Overrides for the effect's defaults. */
  readonly config?: Partial<C>;
  /** The overlay's z-index while the burst runs. Defaults to 2147483647. */
  readonly zIndex?: number;
  /**
   * Called once, in a microtask, when the burst ends on its own: its last
   * particle is gone, or it was skipped. Not called after `cancel()`.
   */
  readonly onComplete?: () => void;
  /** Skips the burst when the user prefers reduced motion. Defaults to true. */
  readonly respectReducedMotion?: boolean;
  /** Seeds the burst's generator, so the same seed plays the same burst. */
  readonly seed?: number;
}

/** A burst started by `fire()`. */
export interface Burst {
  /** Ends the burst at once, without calling `onComplete`. */
  cancel(): void;
  /** Resolves once the burst has ended, with how it ended. Never rejects. */
  readonly finished: Promise<BurstEnd>;
  /**
   * The renderer the burst was given, set before `fire()` returns. Undefined
   * when the burst was skipped before it got one: under reduced motion, from
   * an empty ref, or with no renderer available (ADR 0047).
   */
  readonly renderer: RendererKind | undefined;
}

export interface StageOptions {
  readonly loop: Loop;
  readonly overlay: Overlay;
  readonly atlas: Atlas;
}

/** Runs bursts on one loop, overlay and atlas. */
export interface Stage {
  fire(effect: Effect, options: FireOptions): Burst;
}

/** A burst whose simulation has started. */
export interface Running {
  readonly simulation: Simulation;
  readonly batch: Batch;
  readonly renderer: Renderer;
  end(how: BurstEnd): void;
}
