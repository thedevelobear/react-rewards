import { expect, type Page, test } from '@playwright/test';
import { bandAbove, expectDrawn, overlay } from './util';

/** The key `useTheme` and the pre-paint script in `index.html` share. */
const THEME_KEY = 'react-rewards:theme';

/** `--bg` in each theme, as computed. */
const BACKGROUND = { light: 'rgb(255, 255, 255)', dark: 'rgb(13, 14, 16)' };

const background = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

const dataTheme = (page: Page) =>
  page.evaluate(() => document.documentElement.dataset.theme ?? null);

test('"Reward me" draws on the overlay', async ({ page }) => {
  await page.goto('/');
  const button = page.getByTestId('reward');
  const { drawn } = await expectDrawn(await bandAbove(page, button, 120));
  await button.click();
  await expect(overlay(page)).toHaveCount(1);
  await drawn();
});

test('the hash picks the effect (ADR 0046)', async ({ page }) => {
  const heading = page.getByRole('heading', { level: 1 });
  const nav = page.getByRole('navigation', { name: 'Effects' });

  await page.goto('/#emoji');
  await expect(heading).toHaveText('Emoji');
  await expect(page).toHaveTitle('Emoji · react-rewards');
  await expect(nav.getByRole('link', { name: 'Emoji' })).toHaveAttribute(
    'aria-current',
    'page'
  );

  await nav.getByRole('link', { name: 'Balloons' }).click();
  await expect(page).toHaveURL(/#balloon$/);
  await expect(heading).toHaveText('Balloons');

  await page.goBack();
  await expect(heading).toHaveText('Emoji');

  await page.goto('/#nothing');
  await expect(heading).toHaveText('Confetti');
});

test('a stored theme applies before the app runs', async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, 'dark');
  }, THEME_KEY);
  // Without the app's scripts, only the inline script can set the theme.
  await page.route('**/static/js/**', (route) => route.abort());
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  expect(await dataTheme(page)).toBe('dark');
  expect(await background(page)).toBe(BACKGROUND.dark);
});

test('the switcher cycles the theme, and a reload keeps it', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const switcher = page.getByTestId('theme');
  await expect(switcher).toHaveText('Theme: System');
  expect(await dataTheme(page)).toBe(null);

  await switcher.click();
  await expect(switcher).toHaveText('Theme: Light');
  await switcher.click();
  await expect(switcher).toHaveText('Theme: Dark');
  expect(await dataTheme(page)).toBe('dark');
  expect(await background(page)).toBe(BACKGROUND.dark);

  await page.reload();
  await expect(switcher).toHaveText('Theme: Dark');
  expect(await dataTheme(page)).toBe('dark');

  await switcher.click();
  await expect(switcher).toHaveText('Theme: System');
  expect(await dataTheme(page)).toBe(null);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), THEME_KEY)
  ).toBe(null);
});

test('"system" follows the OS appearance live', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  expect(await background(page)).toBe(BACKGROUND.light);
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await background(page)).toBe(BACKGROUND.dark);
});
