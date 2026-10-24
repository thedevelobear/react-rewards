import type { SpriteSource } from '@/core/define-effect';
import type { SpriteSize } from './types';

/**
 * Emoji glyphs often reach past their font size, so an emoji's box is this
 * much larger than `size`. The glyph is centred in it.
 */
export const EMOJI_BOX = 1.25;

const EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

/** The size a source is drawn at, in CSS pixels. */
export const spriteSize = (source: SpriteSource): SpriteSize => {
  if ('emoji' in source) {
    const side = source.size * EMOJI_BOX;
    return { width: side, height: side };
  }
  if ('shape' in source && source.shape === 'circle') {
    return { width: source.size, height: source.size };
  }
  return { width: source.width, height: source.height };
};

/** A string that is equal for two sources exactly when they draw the same. */
export const spriteKey = (source: SpriteSource): string => {
  const { width, height } = spriteSize(source);
  const size = `${width}x${height}`;
  if ('shape' in source) return `${source.shape}|${source.color}|${size}`;
  if ('emoji' in source) return `emoji|${source.emoji}|${size}`;
  if ('svg' in source) return `svg|${source.svg}|${size}`;
  return `draw|${source.key}|${size}`;
};

/**
 * Paints `source` into the box from (0, 0) to its CSS size. The caller sets
 * the transform that maps that box onto its place in the atlas. `image` is
 * the decoded image of an SVG source.
 */
export const drawSprite = (
  ctx: CanvasRenderingContext2D,
  source: SpriteSource,
  image?: CanvasImageSource
): void => {
  const { width, height } = spriteSize(source);
  ctx.save();
  // Keep every sprite inside its box, so it can't paint over a neighbour.
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();
  if ('shape' in source) {
    ctx.fillStyle = source.color;
    if (source.shape === 'rect') {
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if ('emoji' in source) {
    ctx.font = `${source.size}px ${EMOJI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(source.emoji, width / 2, height / 2);
  } else if ('svg' in source) {
    if (image) ctx.drawImage(image, 0, 0, width, height);
  } else {
    source.draw(ctx, width, height);
  }
  ctx.restore();
};

/** Decodes SVG markup into an image that can be drawn onto a canvas. */
export const loadSvgImage = async (svg: string): Promise<CanvasImageSource> => {
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();
  return image;
};
