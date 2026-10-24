import { expect, type Page, test } from '@playwright/test';
import { overlay, overlayKind } from './util';

/** A confetti burst ends within this, in headless Chromium. */
const BURST_TIMEOUT = 15_000;

const readout = (page: Page) => page.getByTestId('stress-readout');

/** The button for `option` in the setting called `name`. */
const option = (page: Page, name: string, option: string) =>
  page.getByRole('group', { name }).getByRole('button', { name: option });

/** Opens the Stress test with a small count, so bursts are quick. */
const open = async (page: Page) => {
  await page.goto('/#stress-test');
  await page.getByLabel('count').fill('100');
};

test('Stress test is a guide, and its readout waits for a burst', async ({
  page,
}) => {
  await page.goto('/#stress-test');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Stress test'
  );
  await expect(page).toHaveTitle('Stress test · react-rewards');
  await expect(
    page
      .getByRole('navigation', { name: 'Pages' })
      .getByRole('link', { name: 'Stress test' })
  ).toHaveAttribute('aria-current', 'page');
  await expect(readout(page)).toHaveText('Ready');
  await expect(page.getByLabel('count')).toHaveValue('5000');
});

test('the readout shows the renderer and the fps, then the average', async ({
  page,
}) => {
  await open(page);
  await page.getByTestId('reward').click();
  await expect(readout(page)).toHaveText(/^WebGL · \d+ fps$/);
  await expect(readout(page)).toHaveAttribute('data-state', 'done', {
    timeout: BURST_TIMEOUT,
  });
  await expect(readout(page)).toHaveText(/^WebGL · \d+ fps avg$/);
});

test('the renderer setting forces one, until the page is left', async ({
  page,
}) => {
  await open(page);
  const canvas = option(page, 'renderer', 'Canvas 2D');
  await canvas.click();
  await expect(canvas).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('reward').click();
  await expect(readout(page)).toHaveText(/^Canvas 2D · /);
  expect(await overlayKind(page)).toBe('canvas');
  await expect(readout(page)).toHaveAttribute('data-state', 'done', {
    timeout: BURST_TIMEOUT,
  });

  // The effect pages always use Auto (README, "Stress test").
  await page
    .getByRole('navigation', { name: 'Pages' })
    .getByRole('link', { name: 'Confetti' })
    .click();
  await page.getByTestId('reward').click();
  await expect(overlay(page)).toHaveCount(1);
  expect(await overlayKind(page)).toBe('webgl');
});

test('a skipped burst reads Skipped', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await page.getByTestId('reward').click();
  await expect(readout(page)).toHaveText('Skipped');
});

test('the Stress test fits a phone without scrolling sideways', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/#stress-test');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
  ).toBe(0);
});
