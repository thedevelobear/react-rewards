import { type Atlas, createAtlas } from '@/core/atlas';
import {
  type Effect,
  type EffectConfig,
  resolveConfig,
  type SpriteSource,
} from '@/core/define-effect';
import { getLoop, type Loop } from '@/core/loop';
import { prefersReducedMotion } from '@/core/motion';
import { resolveOrigin } from '@/core/origin';
import {
  type Batch,
  createOverlay,
  createRenderer,
  type Overlay,
  type Renderer,
  type RendererPreference,
} from '@/core/renderer';
import { createSimulation, type Simulation } from '@/core/simulation';
import type { Burst, BurstEnd, FireOptions } from './types';

/** The z-index a burst draws at unless it sets one (ADR 0029). */
export const DEFAULT_Z_INDEX = 2147483647;

export interface StageOptions {
  readonly loop: Loop;
  readonly overlay: Overlay;
  readonly atlas: Atlas;
}

/** Runs bursts on one loop, overlay and atlas. */
export interface Stage {
  fire<C extends EffectConfig>(
    effect: Effect<C>,
    options: FireOptions<C>
  ): Burst;
}

/** A burst whose simulation has started. */
interface Running {
  readonly simulation: Simulation;
  readonly batch: Batch;
  readonly renderer: Renderer;
  end(how: BurstEnd): void;
}

/** The pixel ratio sprites are rasterised at. 1 outside a browser. */
const pixelRatio = (): number => globalThis.devicePixelRatio || 1;

/**
 * Creates a stage. One frame callback steps every running burst and then
 * draws them all as one frame, in the order they started, so later bursts
 * are on top. The callback is on the loop only while a burst runs.
 */
export const createStage = ({ loop, overlay, atlas }: StageOptions): Stage => {
  const running = new Set<Running>();
  // Reused every frame, so drawing allocates nothing.
  const batches: Batch[] = [];
  let stop: (() => void) | undefined;

  const frame = (dt: number): void => {
    for (const burst of running) {
      try {
        burst.simulation.step(dt);
      } catch {
        // An effect's error ends its own burst and nothing else (ADR 0030).
        burst.end('complete');
        continue;
      }
      if (burst.simulation.done) burst.end('complete');
    }
    batches.length = 0;
    let renderer: Renderer | undefined;
    for (const burst of running) {
      batches.push(burst.batch);
      renderer = burst.renderer;
    }
    renderer?.draw({ atlas, batches });
  };

  const fire = <C extends EffectConfig>(
    effect: Effect<C>,
    options: FireOptions<C>
  ): Burst => {
    let resolve: (how: BurstEnd) => void = () => {};
    const finished = new Promise<BurstEnd>((settle) => {
      resolve = settle;
    });
    let ended = false;
    let release: (() => void) | undefined;
    let entry: Running | undefined;

    const end = (how: BurstEnd): void => {
      if (ended) return;
      ended = true;
      if (entry) {
        running.delete(entry);
        if (running.size === 0) {
          stop?.();
          stop = undefined;
        }
      }
      release?.();
      const { onComplete } = options;
      if (onComplete && how !== 'cancelled') queueMicrotask(onComplete);
      resolve(how);
    };

    const burst: Burst = { cancel: () => end('cancelled'), finished };

    const respectReducedMotion = options.respectReducedMotion ?? true;
    const origin = resolveOrigin(options.origin);
    if ((respectReducedMotion && prefersReducedMotion()) || !origin) {
      end('skipped');
      return burst;
    }
    // Claimed before the sprites load, so the overlay can't be removed, and
    // the atlas cleared, while they do. A lost context ends the burst like
    // an effect error would, or skips it if it hadn't started (ADR 0036).
    const lease = overlay.acquire(options.zIndex ?? DEFAULT_Z_INDEX, () =>
      end(entry ? 'complete' : 'skipped')
    );
    if (!lease) {
      end('skipped');
      return burst;
    }
    release = lease.release;

    let config: C;
    let sources: readonly SpriteSource[];
    try {
      config = resolveConfig(effect, options.config);
      sources = effect.sprites(config);
    } catch {
      end('skipped');
      return burst;
    }

    atlas.load(sources, pixelRatio()).then(
      (regions) => {
        if (ended) return;
        let simulation: Simulation;
        try {
          simulation = createSimulation(effect, config, {
            origin,
            seed: options.seed,
          });
        } catch {
          end('skipped');
          return;
        }
        entry = {
          simulation,
          batch: { pool: simulation.pool, regions, blend: effect.blend },
          renderer: lease.renderer,
          end,
        };
        running.add(entry);
        stop ??= loop.add(frame);
      },
      () => end('skipped')
    );
    return burst;
  };

  return { fire };
};

let preference: RendererPreference = 'auto';
let shared: { stage: Stage; overlay: Overlay } | undefined;

const getStage = (): Stage => {
  if (!shared) {
    const atlas = createAtlas();
    const overlay = createOverlay({
      createRenderer: (createCanvas, onLost) =>
        createRenderer(preference, createCanvas, onLost),
      // An idle page drops its sprites along with its canvas (ADR 0020).
      onUnmount: () => atlas.clear(),
    });
    shared = {
      stage: createStage({ loop: getLoop(), atlas, overlay }),
      overlay,
    };
  }
  return shared.stage;
};

/**
 * Chooses the page's renderer. `'auto'`, the default, uses WebGL2 and falls
 * back to Canvas 2D. `'webgl'` and `'canvas'` force one, and bursts are
 * skipped when the browser can't provide it. The choice applies from the
 * next burst: bursts already running finish on the current renderer
 * (ADR 0033).
 */
export const setRenderer = (next: RendererPreference): void => {
  if (next === preference) return;
  preference = next;
  shared?.overlay.reset();
};

/**
 * Plays `effect` once from `options.origin` on the page's shared overlay.
 * The burst starts once its sprites are in the atlas, at least a microtask
 * later (ADR 0021). It is skipped, and `onComplete` still called, when the
 * user prefers reduced motion, the origin is an empty ref, no renderer is
 * available, the sprites fail to load or the effect throws (ADR 0025).
 */
export const fire = <C extends EffectConfig>(
  effect: Effect<C>,
  options: FireOptions<C>
): Burst => getStage().fire(effect, options);
