import type { Atlas, Region } from '@/core/atlas';
import type { BlendMode } from '@/core/define-effect';
import type { Pool } from '@/core/pool';

export type RendererKind = 'webgl' | 'canvas';

/** Which renderer to use. `'auto'` prefers WebGL2 and falls back (ADR 0033). */
export type RendererPreference = 'auto' | RendererKind;

/** One burst's particles, ready to draw. */
export interface Batch {
  readonly pool: Pool;
  /** The burst's sprites, indexed by each particle's `sprite`. */
  readonly regions: readonly Region[];
  readonly blend: BlendMode;
}

/** What one frame draws. Both renderers take the same frame. */
export interface Frame {
  readonly atlas: Atlas;
  /** Drawn in order, so later batches are on top. */
  readonly batches: readonly Batch[];
}

export interface Renderer {
  readonly kind: RendererKind;
  /** The canvas it draws on. The overlay puts it on the page. */
  readonly canvas: HTMLCanvasElement;
  /** Sizes the drawing buffer to `width` by `height` CSS pixels at `dpr`. */
  resize(width: number, height: number, dpr: number): void;
  /** Clears the canvas, then draws the frame. */
  draw(frame: Frame): void;
  clear(): void;
  /** Frees the context's resources. The renderer can't be used afterwards. */
  dispose(): void;
}

/** Creates one kind of renderer on `canvas`, or undefined if it can't. */
export type RendererFactory = (
  canvas: HTMLCanvasElement,
  onLost: () => void
) => Renderer | undefined;

export interface OverlayOptions {
  /**
   * Creates a renderer on canvases from `createCanvas`, which calls `onLost`
   * if its context is lost. Defaults to the `'auto'` choice.
   */
  readonly createRenderer?: (
    createCanvas: () => HTMLCanvasElement,
    onLost: () => void
  ) => Renderer | undefined;
  /** Milliseconds before an unused overlay is removed. */
  readonly idleTimeout?: number;
  /** Called after an unused overlay has been removed with its renderer. */
  readonly onUnmount?: () => void;
}

/** One burst's claim on the overlay. */
export interface OverlayLease {
  readonly renderer: Renderer;
  /** Ends the claim. The last one to end hides the overlay. */
  release(): void;
}

export interface Overlay {
  /**
   * Claims the overlay for one burst. Shows the canvas, creating it and its
   * renderer on first use, at the highest `zIndex` among current claims.
   * Returns undefined, and adds nothing to the page, when no renderer is
   * available. If the renderer's context is lost, every claim ends and its
   * `onLost` is called (ADR 0036).
   */
  acquire(zIndex: number, onLost?: () => void): OverlayLease | undefined;
  /**
   * Drops the canvas and renderer so the next burst creates new ones, for a
   * new renderer choice (ADR 0033). An idle overlay is removed at once. One
   * in use is removed when its last claim ends, instead of being hidden.
   */
  reset(): void;
}

/** What one lease asked for. */
export interface Claim {
  readonly zIndex: number;
  readonly onLost: (() => void) | undefined;
}
