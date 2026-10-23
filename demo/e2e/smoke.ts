import { expect, test } from '@playwright/test';
import { bandAbove, expectDrawn, overlay } from './util';

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

// Emoji are drawn from the platform's font, and balloons from an SVG that
// the atlas decodes. A sprite that fails to load skips the burst.
for (const effect of ['emoji', 'balloon']) {
  test(`${effect} draws on the overlay`, async ({ page }) => {
    const button = page.getByTestId(`fire-${effect}`);
    const { drawn } = await expectDrawn(await bandAbove(page, button, 120));
    await button.click();
    await drawn();
    await expect(page.getByTestId('status')).toHaveText('running');
  });
}

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
