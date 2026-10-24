import type { SpriteSource } from '@/core/define-effect';

/** A glow's box, as a multiple of its core's diameter. */
export const GLOW = 3;
/** A burst's flash, white with a little warmth. */
const FLASH = '255,240,214';

/**
 * The red, green and blue of `color`, read back from the canvas, which
 * writes any sRGB colour as `#rrggbb` or `rgba(...)`. Undefined for a colour
 * it writes another way, such as `oklch(...)`.
 */
const channels = (
  ctx: CanvasRenderingContext2D,
  color: string
): string | undefined => {
  ctx.fillStyle = color;
  const value = String(ctx.fillStyle);
  if (/^#[\da-f]{6}$/i.test(value)) {
    return [1, 3, 5]
      .map((i) => Number.parseInt(value.slice(i, i + 2), 16))
      .join(',');
  }
  return /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/
    .exec(value)
    ?.slice(1, 4)
    .join(',');
};

/**
 * A dot of `color`, `core` pixels across, with a white-hot centre and a halo
 * that fades out to `GLOW` times its size. A colour the canvas can't read
 * back is drawn as a plain dot.
 */
export const glow = (color: string, core: number): SpriteSource => ({
  key: `firework-glow|${color}`,
  width: core * GLOW,
  height: core * GLOW,
  draw: (ctx, width) => {
    const r = width / 2;
    const rgb = channels(ctx, color);
    if (!rgb) {
      ctx.beginPath();
      ctx.arc(r, r, r / GLOW, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(0.12, `rgb(${rgb})`);
    gradient.addColorStop(1 / GLOW, `rgba(${rgb},0.75)`);
    gradient.addColorStop(0.6, `rgba(${rgb},0.18)`);
    gradient.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, width);
  },
});

/** A burst's flash: a soft, warm white light `size` pixels across. */
export const flash = (size: number): SpriteSource => ({
  key: 'firework-flash',
  width: size,
  height: size,
  draw: (ctx, width) => {
    const r = width / 2;
    const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
    gradient.addColorStop(0, `rgba(${FLASH},1)`);
    gradient.addColorStop(0.1, `rgba(${FLASH},0.7)`);
    gradient.addColorStop(0.3, `rgba(${FLASH},0.22)`);
    gradient.addColorStop(0.6, `rgba(${FLASH},0.05)`);
    gradient.addColorStop(1, `rgba(${FLASH},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, width);
  },
});
