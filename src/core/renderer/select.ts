import { createCanvasRenderer } from '@/core/renderer-canvas';
import type { Renderer } from './types';

/**
 * Creates a renderer for a fresh canvas, or undefined if the browser gives
 * it no context. A canvas can only ever have one kind of context, so a
 * different renderer needs a different canvas.
 */
export const createRenderer = (
  canvas: HTMLCanvasElement
): Renderer | undefined => {
  const ctx = canvas.getContext('2d');
  return ctx ? createCanvasRenderer(canvas, ctx) : undefined;
};
