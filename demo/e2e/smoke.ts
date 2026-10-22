import { expect, type Locator, type Page, test } from '@playwright/test';

/** The overlay is the only canvas, directly on body (plan step 1c). */
const overlay = (page: Page) => page.locator('body > canvas');

/**
 * Screenshots a band `height` px tall above `element`. It stops short of the
 * element, so a focus ring or hover style can't change it.
 */
const bandAbove = async (page: Page, element: Locator, height: number) => {
  const box = await element.boundingBox();
  if (!box) throw new Error('The element has no layout box.');
  const bottom = box.y - 8;
  return () =>
    page.screenshot({
      clip: { x: 0, y: bottom - height, width: 1000, height },
    });
};

/** Polls until a screenshot differs from the first one. */
const expectDrawn = async (shoot: () => Promise<Buffer>) => {
  const blank = await shoot();
  return {
    blank,
    // Resolves once particles have crossed the band.
    drawn: () =>
      expect.poll(async () => (await shoot()).equals(blank)).toBe(false),
  };
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('a burst draws on one overlay canvas, hidden once it ends', async ({
  page,
}) => {
  const button = page.getByTestId('fire-confetti');
  const shoot = await bandAbove(page, button, 120);
  const { blank, drawn } = await expectDrawn(shoot);
  await expect(overlay(page)).toHaveCount(0);

  await button.click();
  await expect(page.getByTestId('status')).toHaveText('running');
  await expect(overlay(page)).toHaveCount(1);
  await expect(overlay(page)).toHaveAttribute('aria-hidden', 'true');
  await drawn();

  await expect(page.getByTestId('status')).toHaveText('complete', {
    timeout: 5000,
  });
  await expect(overlay(page)).toBeHidden();
  expect((await shoot()).equals(blank)).toBe(true);
});

test('concurrent bursts share one canvas', async ({ page }) => {
  const button = page.getByTestId('fire-confetti');
  await button.click();
  await button.click();
  await page.getByTestId('fire-at-pointer').click();
  await expect(overlay(page)).toHaveCount(1);
  await expect(page.getByTestId('status')).toHaveText('running');
});

test('a burst inside overflow: hidden and a transform is not clipped', async ({
  page,
}) => {
  const fixture = page.getByTestId('clip-fixture');
  const { drawn } = await expectDrawn(await bandAbove(page, fixture, 60));
  await page.getByTestId('fire-clipped').click();
  await drawn();
});

test('cancel ends a burst at once', async ({ page }) => {
  await page.getByTestId('fire-confetti').click();
  await expect(overlay(page)).toBeVisible();
  await page.getByTestId('cancel-all').click();
  await expect(page.getByTestId('status')).toHaveText('cancelled');
  await expect(overlay(page)).toBeHidden();
});

test('reduced motion skips the burst', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByTestId('fire-confetti').click();
  await expect(page.getByTestId('status')).toHaveText('skipped');
  await expect(overlay(page)).toHaveCount(0);
});
