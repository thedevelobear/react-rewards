import { expect, type Page, test } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { bandAbove, expectDrawn, FIXTURES, overlay, overlayKind } from './util';

/** Hides the page, so a screenshot shows only the overlay. */
const OVERLAY_ONLY = 'main { visibility: hidden; }';

/** How long the seeded burst plays before the screenshot: 20 frames. */
const PLAY_TIME = 320;

/**
 * The share of drawn pixels that may differ between the renderers, beyond
 * anti-aliased edges, which pixelmatch ignores. Measured at 1% (8 of 799) in
 * headless Chromium on SwiftShader. A misplaced, mis-rotated or mis-scaled
 * sprite differs on most of its pixels.
 */
const TOLERANCE = 0.05;

/** Fewer drawn pixels than this means the frame is nearly blank. */
const MIN_DRAWN = 100;

const screenshot = async (page: Page) =>
  PNG.sync.read(await page.screenshot({ style: OVERLAY_ONLY }));

/** Plays the seeded burst on `renderer` and screenshots the overlay. */
const seededFrame = async (page: Page, renderer: 'webgl' | 'canvas') => {
  await page.getByTestId('renderer').selectOption(renderer);
  await page.getByTestId('fire-seeded').click();
  await expect(page.getByTestId('status')).toHaveText('running');
  // A multiple of the fake clock's 16 ms frame, so both bursts see the same
  // frame times.
  await page.clock.runFor(PLAY_TIME);
  expect(await overlayKind(page)).toBe(renderer);
  await expect(page.getByTestId('renderer-given')).toHaveText(renderer);
  const png = await screenshot(page);
  await page.getByTestId('cancel-all').click();
  return png;
};

test('both renderers draw the same seeded frame (ADR 0035)', async ({
  page,
}, testInfo) => {
  await page.clock.install({ time: 0 });
  await page.goto(FIXTURES);
  await page.clock.pauseAt(1000);
  const blank = await screenshot(page);
  const webgl = await seededFrame(page, 'webgl');
  const canvas = await seededFrame(page, 'canvas');

  const { width, height } = blank;
  /** Pixels that differ from the blank page at all. */
  const drawn = (png: PNG) =>
    pixelmatch(blank.data, png.data, null, width, height, { threshold: 0 });
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(
    webgl.data,
    canvas.data,
    diff.data,
    width,
    height
  );
  await testInfo.attach('diff', {
    body: PNG.sync.write(diff),
    contentType: 'image/png',
  });

  const area = [drawn(webgl), drawn(canvas)];
  expect(Math.min(...area)).toBeGreaterThan(MIN_DRAWN);
  expect(mismatched / Math.max(...area)).toBeLessThan(TOLERANCE);
});

test('a lost context ends the burst, and the next one draws (ADR 0036)', async ({
  page,
}) => {
  await page.goto(FIXTURES);
  const button = page.getByTestId('fire-confetti');
  await button.click();
  await expect(overlay(page)).toHaveCount(1);
  expect(await overlayKind(page)).toBe('webgl');

  await overlay(page).evaluate((canvas: HTMLCanvasElement) => {
    canvas
      .getContext('webgl2')
      ?.getExtension('WEBGL_lose_context')
      ?.loseContext();
  });
  await expect(page.getByTestId('status')).toHaveText('complete');
  await expect(overlay(page)).toHaveCount(0);

  const { drawn } = await expectDrawn(await bandAbove(page, button, 120));
  await button.click();
  await drawn();
  expect(await overlayKind(page)).toBe('webgl');
});

test.describe('without WebGL2', () => {
  test.beforeEach(async ({ page }) => {
    // Every request for a WebGL2 context fails, as on an unsupported or
    // blocklisted GPU.
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...rest: unknown[]
      ) {
        if (type === 'webgl2') return null;
        return Reflect.apply(getContext, this, [type, ...rest]);
      } as typeof getContext;
    });
    await page.goto(FIXTURES);
  });

  test("'auto' falls back to Canvas 2D and still plays", async ({ page }) => {
    const button = page.getByTestId('fire-confetti');
    const { drawn } = await expectDrawn(await bandAbove(page, button, 120));
    await button.click();
    await drawn();
    expect(await overlayKind(page)).toBe('canvas');
    await expect(page.getByTestId('renderer-given')).toHaveText('canvas');
  });

  test("a forced 'webgl' skips the burst (ADR 0033)", async ({ page }) => {
    await page.getByTestId('renderer').selectOption('webgl');
    await page.getByTestId('fire-confetti').click();
    await expect(page.getByTestId('status')).toHaveText('skipped');
    await expect(overlay(page)).toHaveCount(0);
    // Skipped before it got a renderer (ADR 0047).
    await expect(page.getByTestId('renderer-given')).toHaveText('none');
  });
});
