import { expect, type Locator, type Page } from '@playwright/test';

/** The bare page with the fixtures the specs use (ADR 0045). */
export const FIXTURES = '/fixtures.html';

/** The overlay is the only canvas, directly on body (plan step 1c). */
export const overlay = (page: Page): Locator => page.locator('body > canvas');

/** Which renderer drew on the overlay, from the kind of context it has. */
export const overlayKind = (page: Page): Promise<'webgl' | 'canvas'> =>
  overlay(page).evaluate((canvas: HTMLCanvasElement) =>
    // A canvas gives out only its own kind of context, and null otherwise.
    canvas.getContext('webgl2') ? 'webgl' : 'canvas'
  );

/**
 * Screenshots a band `height` px tall above `element`. It stops short of the
 * element, so a focus ring or hover style can't change it.
 */
export const bandAbove = async (
  page: Page,
  element: Locator,
  height: number
): Promise<() => Promise<Buffer>> => {
  const box = await element.boundingBox();
  if (!box) throw new Error('The element has no layout box.');
  const bottom = box.y - 8;
  return () =>
    page.screenshot({
      clip: { x: 0, y: bottom - height, width: 1000, height },
    });
};

/** Polls until a screenshot differs from the first one. */
export const expectDrawn = async (
  shoot: () => Promise<Buffer>
): Promise<{ blank: Buffer; drawn: () => Promise<void> }> => {
  const blank = await shoot();
  return {
    blank,
    // Resolves once particles have crossed the band.
    drawn: () =>
      expect.poll(async () => (await shoot()).equals(blank)).toBe(false),
  };
};
