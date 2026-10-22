import type { Atlas, Region } from '@/core/atlas';
import type { BlendMode } from '@/core/define-effect';
import type { Pool } from '@/core/pool';

export type RendererKind = 'webgl' | 'canvas';

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
  /** Sizes the drawing buffer to `width` by `height` CSS pixels at `dpr`. */
  resize(width: number, height: number, dpr: number): void;
  /** Clears the canvas, then draws the frame. */
  draw(frame: Frame): void;
  clear(): void;
  /** Frees the context's resources. The renderer can't be used afterwards. */
  dispose(): void;
}
