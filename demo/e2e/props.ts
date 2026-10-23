import { expect, type Page, test } from '@playwright/test';
import { PNG } from 'pngjs';
import { bandAbove } from './util';

/** The key `usePackageManager` stores the choice under. */
const PACKAGE_MANAGER_KEY = 'react-rewards:package-manager';

/** `--accent-text` in each theme, as computed: the keyword colour. */
const KEYWORD = { light: 'rgb(204, 51, 68)', dark: 'rgb(255, 95, 109)' };

const tab = (page: Page, name: 'Preview' | 'Code') =>
  page.getByRole('tab', { name });

const slider = (page: Page, name: string) =>
  page.getByRole('slider', { name, exact: true });

/** The snippet, in the Code tab once it is open. */
const snippet = (page: Page) =>
  page.getByRole('tabpanel', { name: 'Code' }).locator('pre');

const openCode = async (page: Page) => {
  await tab(page, 'Code').click();
  return snippet(page);
};

/** Whether `png` has a pixel of nearly pure blue. */
const hasBlue = (png: PNG) => {
  for (let i = 0; i < png.data.length; i += 4) {
    const [r = 0, g = 0, b = 0] = png.data.subarray(i, i + 3);
    if (b > 200 && r < 40 && g < 40) return true;
  }
  return false;
};

test('the props panel sets the snippet, and Reset restores the defaults (ADR 0051)', async ({
  page,
}) => {
  await page.goto('/');
  const reset = page.getByRole('button', { name: 'Reset' });
  await expect(reset).toBeDisabled();

  await slider(page, 'count').fill('120');
  await slider(page, 'drag').fill('2.5');
  await expect(reset).toBeEnabled();
  // Only the values that differ from the defaults are written.
  await expect(await openCode(page)).toContainText(
    'useReward(ref, confetti, { count: 120, drag: 2.5, });'
  );

  await tab(page, 'Preview').click();
  await reset.click();
  await expect(slider(page, 'count')).toHaveValue('50');
  await expect(await openCode(page)).toContainText('useReward(ref, confetti);');
});

test('the preview fires with the panel’s settings', async ({ page }) => {
  await page.goto('/');
  // The defaults have no pure blue, so a blue piece comes from the panel.
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: 'Remove colour 1' }).click();
  }
  await expect(
    page.getByRole('button', { name: 'Remove colour 1' })
  ).toBeDisabled();
  await page.getByLabel('Colour 1', { exact: true }).fill('#0000ff');

  // Editing the colours scrolled the preview up, so bring it back.
  await page.evaluate(() => window.scrollTo(0, 0));
  const button = page.getByTestId('reward');
  const shoot = await bandAbove(page, button, 120);
  expect(hasBlue(PNG.sync.read(await shoot()))).toBe(false);
  await button.click();
  await expect
    .poll(async () => hasBlue(PNG.sync.read(await shoot())))
    .toBe(true);
});

test('colours are swatches that can be changed, removed and added (ADR 0052)', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Remove colour 2' }).click();
  await page.getByLabel('Add a colour').fill('#123abc');
  await page.getByLabel('Colour 1', { exact: true }).fill('#ff0000');
  await expect(await openCode(page)).toContainText(
    "colors: ['#ff0000', '#72F753', '#F76C88', '#F5F770', '#123abc'],"
  );
});

test('emoji are chips, and the switch sets a boolean (ADR 0052)', async ({
  page,
}) => {
  await page.goto('/#emoji');
  const field = page.getByLabel('Emoji to add');
  // A family emoji is several code points, and stays whole.
  await field.fill('🎉 👩‍👩‍👧');
  await field.press('Enter');
  await expect(field).toHaveValue('');
  await page.getByRole('button', { name: 'Remove 🤓' }).click();
  await page.getByRole('switch', { name: 'rotate' }).click();
  await expect(await openCode(page)).toContainText(
    "useReward(ref, emoji, { rotate: false, emojis: ['😊', '🥳', '🎉', '👩‍👩‍👧'], });"
  );
});

test('another effect starts with its defaults, on the Preview tab', async ({
  page,
}) => {
  await page.goto('/');
  await slider(page, 'count').fill('120');
  await openCode(page);
  await page
    .getByRole('navigation', { name: 'Effects' })
    .getByRole('link', { name: 'Emoji' })
    .click();
  await expect(tab(page, 'Preview')).toHaveAttribute('aria-selected', 'true');
  await expect(slider(page, 'count')).toHaveValue('20');
  await expect(await openCode(page)).toContainText('useReward(ref, emoji);');
});

test('the tabs follow the arrow, Home and End keys (ADR 0051)', async ({
  page,
}) => {
  await page.goto('/');
  const preview = tab(page, 'Preview');
  const code = tab(page, 'Code');
  await preview.focus();

  await page.keyboard.press('ArrowRight');
  await expect(code).toBeFocused();
  await expect(code).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Code' })).toBeVisible();
  await expect(page.getByTestId('reward')).toBeHidden();

  await page.keyboard.press('ArrowRight');
  await expect(preview).toBeFocused();
  await page.keyboard.press('End');
  await expect(code).toBeFocused();
  await page.keyboard.press('Home');
  await expect(preview).toBeFocused();
  await expect(page.getByTestId('reward')).toBeVisible();
});

test('the snippet takes its colours from the theme’s tokens (ADR 0053)', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const code = await openCode(page);
  await expect(code).toHaveAttribute('data-highlighted', 'true');
  const keyword = code.locator('span span', { hasText: /^import$/ }).first();
  await expect(keyword).toHaveCSS('color', KEYWORD.light);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(keyword).toHaveCSS('color', KEYWORD.dark);
});

test('the install command follows the package manager, and a reload keeps it', async ({
  page,
}) => {
  await page.goto('/');
  await openCode(page);
  const command = page.getByTestId('install-command');
  await expect(command).toHaveText('pnpm add react-rewards');

  const npm = page.getByRole('button', { name: 'npm', exact: true });
  await npm.click();
  await expect(npm).toHaveAttribute('aria-pressed', 'true');
  await expect(command).toHaveText('npm install react-rewards');
  expect(
    await page.evaluate((key) => localStorage.getItem(key), PACKAGE_MANAGER_KEY)
  ).toBe('npm');

  await page.reload();
  await openCode(page);
  await expect(command).toHaveText('npm install react-rewards');
});

test('the copy buttons put the snippet and the command on the clipboard', async ({
  context,
  page,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const clipboard = () => page.evaluate(() => navigator.clipboard.readText());
  await page.goto('/');
  await slider(page, 'count').fill('120');
  await openCode(page);

  const copySnippet = page.getByRole('button', { name: 'Copy the snippet' });
  await copySnippet.click();
  await expect(copySnippet).toHaveText('Copied');
  const copied = await clipboard();
  expect(copied).toContain('    count: 120,\n');
  expect(copied.endsWith('};\n')).toBe(true);

  await page.getByRole('button', { name: 'Copy the install command' }).click();
  expect(await clipboard()).toBe('pnpm add react-rewards');
});

test('the props table lists every setting with its default (ADR 0054)', async ({
  page,
}) => {
  await page.goto('/#balloon');
  const table = page.getByRole('table');
  // A header row, then one per setting.
  await expect(table.getByRole('row')).toHaveCount(10);
  await expect(table.getByRole('row', { name: /^gravity / })).toContainText(
    'number-300Downward acceleration'
  );
  await expect(table.getByRole('row', { name: /^colors / })).toContainText(
    "string[]['#A45BF1',"
  );
});

test('both tabs fit a phone without scrolling sideways', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const overflow = () =>
    page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
  expect(await overflow()).toBe(0);
  await openCode(page);
  expect(await overflow()).toBe(0);
});
