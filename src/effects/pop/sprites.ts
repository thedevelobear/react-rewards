import type { SpriteSource } from '@/core/define-effect';
import type { Rgb } from './types';

/** A star's box, as a multiple of its span, so its halo shows. */
export const STAR_BOX = 1.75;
/** How far a star's side points reach, as a share of its front and back. */
const STAR_ACROSS = 0.8;
/**
 * Where a star's concave sides bend, as a share of its half-span from the
 * centre along each diagonal. Smaller makes thinner points.
 */
const STAR_WAIST = 0.16;

/** A streak's box: twice its base length wide, so its head is at the middle. */
export const TAIL_BOX = 0.7;
/** A streak's half-width at its widest, and its halo's, as shares of its base length. */
const TAIL_CORE = 0.08;
const TAIL_HALO = 0.22;
/** Where along a streak it is widest, as a share of its length from the tail. */
const TAIL_WIDEST = 0.85;

/** A dot's box, as a multiple of its diameter. */
export const DOT_BOX = 2.4;

/** The share of white mixed into the middle of the flash. */
const FLASH_TINT = 0.65;

/**
 * The red, green and blue of `color`, read back from the canvas, which
 * writes any sRGB colour as `#rrggbb` or `rgba(...)`. Undefined for a colour
 * it writes another way, such as `oklch(...)`, which is then drawn without
 * a halo.
 */
const channels = (
  ctx: CanvasRenderingContext2D,
  color: string
): Rgb | undefined => {
  ctx.fillStyle = color;
  const value = String(ctx.fillStyle);
  if (/^#[\da-f]{6}$/i.test(value)) {
    const n = Number.parseInt(value.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const match = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(value);
  return match
    ? [Number(match[1]), Number(match[2]), Number(match[3])]
    : undefined;
};

const rgba = ([r, g, b]: Rgb, alpha: number): string =>
  `rgba(${r},${g},${b},${alpha})`;

/**
 * A four-point star of `color`, `size` pixels from tip to tip, with concave
 * sides and a soft round halo. Its front and back points lie along x, so it
 * points the way its streak does.
 */
export const star = (color: string, size: number): SpriteSource => ({
  key: `pop-star|${color}`,
  width: size * STAR_BOX,
  height: size * STAR_BOX,
  draw: (ctx, width) => {
    const c = width / 2;
    const rgb = channels(ctx, color);
    if (rgb) {
      const halo = ctx.createRadialGradient(c, c, 0, c, c, c);
      halo.addColorStop(0, rgba(rgb, 0.45));
      halo.addColorStop(0.3, rgba(rgb, 0.2));
      halo.addColorStop(0.62, rgba(rgb, 0.06));
      halo.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, width);
    }
    const along = width / STAR_BOX / 2;
    const across = along * STAR_ACROSS;
    const waist = along * STAR_WAIST;
    ctx.beginPath();
    ctx.moveTo(c + along, c);
    ctx.quadraticCurveTo(c + waist, c + waist, c, c + across);
    ctx.quadraticCurveTo(c - waist, c + waist, c - along, c);
    ctx.quadraticCurveTo(c - waist, c - waist, c, c - across);
    ctx.quadraticCurveTo(c + waist, c - waist, c + along, c);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  },
});

/**
 * A streak of `color`, `size` pixels long at a `scaleX` of 1: a needle that
 * runs from a faded point at the box's left edge to its head at the box's
 * middle, where its particle is, with a soft halo along it. Nothing is drawn
 * right of the middle, so however far it is stretched, it trails its star.
 */
export const tail = (color: string, size: number): SpriteSource => ({
  key: `pop-tail|${color}`,
  width: size * 2,
  height: size * TAIL_BOX,
  draw: (ctx, width, height) => {
    const length = width / 2;
    const middle = height / 2;
    const needle = (half: number) => {
      ctx.beginPath();
      ctx.moveTo(0, middle);
      ctx.lineTo(length * TAIL_WIDEST, middle - half);
      ctx.quadraticCurveTo(length, middle - half, length, middle);
      ctx.quadraticCurveTo(
        length,
        middle + half,
        length * TAIL_WIDEST,
        middle + half
      );
      ctx.closePath();
    };
    const rgb = channels(ctx, color);
    if (!rgb) {
      needle(length * TAIL_CORE);
      ctx.fillStyle = color;
      ctx.fill();
      return;
    }
    // Brightest at the head, and faded out at the tail.
    const fade = (alpha: number) => {
      const gradient = ctx.createLinearGradient(0, 0, length, 0);
      gradient.addColorStop(0, rgba(rgb, 0));
      gradient.addColorStop(0.5, rgba(rgb, alpha * 0.35));
      gradient.addColorStop(1, rgba(rgb, alpha));
      return gradient;
    };
    needle(length * TAIL_HALO);
    ctx.fillStyle = fade(0.2);
    ctx.fill();
    needle(length * TAIL_CORE);
    ctx.fillStyle = fade(1);
    ctx.fill();
  },
});

/** A round dot of `color`, `diameter` pixels across, with a soft halo. */
export const dot = (color: string, diameter: number): SpriteSource => ({
  key: `pop-dot|${color}`,
  width: diameter * DOT_BOX,
  height: diameter * DOT_BOX,
  draw: (ctx, width) => {
    const c = width / 2;
    const core = c / DOT_BOX;
    const rgb = channels(ctx, color);
    if (rgb) {
      const halo = ctx.createRadialGradient(c, c, 0, c, c, c);
      halo.addColorStop(0, rgba(rgb, 0.5));
      halo.addColorStop(1 / DOT_BOX, rgba(rgb, 0.3));
      halo.addColorStop(0.7, rgba(rgb, 0.08));
      halo.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, width);
    }
    ctx.beginPath();
    ctx.arc(c, c, core, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  },
});

/**
 * The flash: a soft light of `color`, `size` pixels across, paler in the
 * middle, so it shows on light pages as well as dark.
 */
export const flash = (color: string, size: number): SpriteSource => ({
  key: `pop-flash|${color}`,
  width: size,
  height: size,
  draw: (ctx, width) => {
    const r = width / 2;
    const rgb = channels(ctx, color);
    if (!rgb) {
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(r, r, r / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      return;
    }
    const paler = (v: number) => Math.round(v + (255 - v) * FLASH_TINT);
    const pale: Rgb = [paler(rgb[0]), paler(rgb[1]), paler(rgb[2])];
    const light = ctx.createRadialGradient(r, r, 0, r, r, r);
    light.addColorStop(0, rgba(pale, 1));
    light.addColorStop(0.25, rgba(rgb, 0.7));
    light.addColorStop(0.55, rgba(rgb, 0.25));
    light.addColorStop(1, rgba(rgb, 0));
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, width, width);
  },
});
