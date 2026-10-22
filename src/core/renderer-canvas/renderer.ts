import type { Renderer } from '@/core/renderer';

/**
 * The Canvas 2D fallback renderer. It draws each particle from the atlas
 * with one `setTransform` and one `drawImage`, using `globalAlpha` for alpha
 * and `lighter` compositing for additive blending.
 */
export const createCanvasRenderer = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): Renderer => {
  let dpr = 1;

  const clear = (): void => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return {
    kind: 'canvas',
    resize: (width, height, ratio) => {
      dpr = ratio;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    },
    draw: ({ atlas, batches }) => {
      clear();
      const image = atlas.canvas;
      for (const { pool, regions, blend } of batches) {
        ctx.globalCompositeOperation =
          blend === 'additive' ? 'lighter' : 'source-over';
        const { x, y, rotation, scale, scaleX, scaleY, alpha, sprite } =
          pool.fields;
        for (let i = 0; i < pool.count; i++) {
          const opacity = alpha[i] ?? 0;
          const region = regions[(sprite[i] ?? 0) | 0];
          if (opacity <= 0 || !region) continue;
          const size = (scale[i] ?? 0) * dpr;
          const kx = size * (scaleX[i] ?? 0);
          const ky = size * (scaleY[i] ?? 0);
          if (kx === 0 || ky === 0) continue;
          const angle = rotation[i] ?? 0;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          ctx.globalAlpha = Math.min(opacity, 1);
          ctx.setTransform(
            cos * kx,
            sin * kx,
            -sin * ky,
            cos * ky,
            (x[i] ?? 0) * dpr,
            (y[i] ?? 0) * dpr
          );
          ctx.drawImage(
            image,
            region.sx,
            region.sy,
            region.sw,
            region.sh,
            -region.width / 2,
            -region.height / 2,
            region.width,
            region.height
          );
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    },
    clear,
    dispose: () => {
      clear();
      // A zero-sized canvas releases its backing store straight away.
      canvas.width = 0;
      canvas.height = 0;
    },
  };
};
