import { createCanvasRenderer } from '@/core/renderer-canvas';
import { CONTEXT_ATTRIBUTES, createWebglRenderer } from '@/core/renderer-webgl';
import type { Renderer, RendererKind, RendererPreference } from './types';

type Factory = (
  canvas: HTMLCanvasElement,
  onLost: () => void
) => Renderer | undefined;

const factories: Readonly<Record<RendererKind, Factory>> = {
  webgl: (canvas, onLost) => {
    const gl = canvas.getContext('webgl2', CONTEXT_ATTRIBUTES);
    if (!gl) return undefined;
    try {
      return createWebglRenderer(canvas, gl, onLost);
    } catch {
      // The context works but the renderer can't be built on it. Free it.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return undefined;
    }
  },
  canvas: (canvas) => {
    const ctx = canvas.getContext('2d');
    return ctx ? createCanvasRenderer(canvas, ctx) : undefined;
  },
};

/**
 * Creates the renderer `preference` asks for, or undefined if the browser
 * can't provide it. `'auto'` tries WebGL2, then Canvas 2D. A forced kind
 * never falls back (ADR 0033). Each attempt draws on a fresh canvas from
 * `createCanvas`, because a canvas keeps the first kind of context it gives
 * out. `onLost` is called if the renderer's context is lost later.
 */
export const createRenderer = (
  preference: RendererPreference,
  createCanvas: () => HTMLCanvasElement,
  onLost: () => void = () => {}
): Renderer | undefined => {
  const kinds: readonly RendererKind[] =
    preference === 'auto' ? ['webgl', 'canvas'] : [preference];
  for (const kind of kinds) {
    const renderer = factories[kind](createCanvas(), onLost);
    if (renderer) return renderer;
  }
  return undefined;
};
