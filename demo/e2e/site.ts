import { expect, type Page, test } from '@playwright/test';
import { bandAbove, expectDrawn, overlay } from './util';

/** The key `useTheme` and the pre-paint script in `index.html` share. */
const THEME_KEY = 'react-rewards:theme';

/** The key `usePackageManager` stores the choice under. */
const PACKAGE_MANAGER_KEY = 'react-rewards:package-manager';

/** `--bg` in each theme, as computed. */
const BACKGROUND = { light: 'rgb(255, 255, 255)', dark: 'rgb(10, 10, 11)' };

const background = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

const dataTheme = (page: Page) =>
  page.evaluate(() => document.documentElement.dataset.theme ?? null);

/** The `theme-color` tags' colours, for light then dark. */
const themeColors = (page: Page) =>
  page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    ].map((tag) => tag.content)
  );

test('"Reward me" draws on the overlay', async ({ page }) => {
  await page.goto('/#confetti');
  const button = page.getByTestId('reward');
  const { drawn } = await expectDrawn(await bandAbove(page, button, 120));
  await button.click();
  await expect(overlay(page)).toHaveCount(1);
  await drawn();
});

test('the hash picks the effect', async ({ page }) => {
  const heading = page.getByRole('heading', { level: 1 });
  const nav = page.getByRole('navigation', { name: 'Pages' });

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
  await expect(heading).toHaveText('Getting started');
});

test('Getting started is the home page', async ({ page }) => {
  const heading = page.getByRole('heading', { level: 1 });
  await page.goto('/');
  await expect(heading).toHaveText('Getting started');
  await expect(page).toHaveTitle('Getting started · react-rewards');
  await expect(
    page
      .getByRole('navigation', { name: 'Pages' })
      .getByRole('link', { name: 'Getting started' })
  ).toHaveAttribute('aria-current', 'page');
  await expect(page.getByTestId('install-command')).toHaveText(
    'pnpm add react-rewards'
  );
  await expect(page.locator('pre')).toContainText('useReward(ref, confetti);');

  // An effect's page has no install command, and the logo leads home.
  await page.goto('/#emoji');
  await expect(page.getByTestId('install-command')).toHaveCount(0);
  await page.getByRole('link', { name: 'react-rewards', exact: true }).click();
  await expect(page).toHaveURL(/#getting-started$/);
  await expect(heading).toHaveText('Getting started');
});

test('the pager leads to the pages before and after, from the top', async ({
  page,
}) => {
  const heading = page.getByRole('heading', { level: 1 });
  const pager = page.getByRole('navigation', { name: 'Previous and next' });

  await page.goto('/');
  await expect(pager.getByRole('link')).toHaveCount(1);
  const next = pager.getByRole('link', { name: 'Next Custom effects' });
  await next.click();
  await expect(heading).toHaveText('Custom effects');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  // The last effect has no next page.
  await page.goto('/#firework');
  await expect(pager.getByRole('link')).toHaveCount(1);
  await pager.getByRole('link', { name: 'Previous Balloons' }).click();
  await expect(page).toHaveURL(/#balloon$/);
});

test('every sidebar link shows its page, and links between pages lead to one', async ({
  page,
}) => {
  const heading = page.getByRole('heading', { level: 1 });
  const nav = page.getByRole('navigation', { name: 'Pages' });
  await page.goto('/');
  const links = await nav.getByRole('link').evaluateAll((elements) =>
    elements.map((element) => ({
      href: element.getAttribute('href') ?? '',
      label: element.textContent ?? '',
    }))
  );
  expect(links.map(({ label }) => label)).toEqual([
    'Getting started',
    'Custom effects',
    'Server rendering',
    'Upgrading from v2',
    'Stress test',
    'useReward',
    'fire',
    'Renderers',
    'Confetti',
    'Emoji',
    'Balloons',
    'Fireworks',
  ]);
  const hrefs = links.map(({ href }) => href);

  for (const { href, label } of links) {
    await page.goto(`/${href}`);
    await expect(heading).toHaveText(label);
    const targets = await page
      .getByRole('main')
      .locator('a[href^="#"]')
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('href'))
      );
    for (const target of targets) expect(hrefs).toContain(target);
  }
});

test("useReward's settings table shows each effect's defaults", async ({
  page,
}) => {
  await page.goto('/#use-reward');
  const settings = page.getByRole('table').first();
  const cells = (name: RegExp) =>
    settings.getByRole('row', { name }).getByRole('cell').allTextContents();
  // The unit, then confetti, emoji, balloon and firework.
  expect(await cells(/^count /)).toEqual(['', '100', '20', '16', '3']);
  expect(await cells(/^gravity /)).toEqual([
    'px/s²',
    '900',
    '900',
    '-300',
    '180',
  ]);
  expect(await cells(/^rotate /)).toEqual(['', '', 'true', '', '']);
  expect(await cells(/^spiral /)).toEqual(['px', '', '', '', '3.5']);
});

test('the effect cards lead to the effects', async ({ page }) => {
  const heading = page.getByRole('heading', { level: 1 });
  await page.goto('/');
  await page.getByRole('link', { name: /^Emoji / }).click();
  await expect(page).toHaveURL(/#emoji$/);
  await expect(heading).toHaveText('Emoji');
});

test('the install command follows the package manager, and a reload keeps it', async ({
  page,
}) => {
  await page.goto('/');
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
  await expect(command).toHaveText('npm install react-rewards');
});

test('the install command and the example can be copied', async ({
  context,
  page,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const clipboard = () => page.evaluate(() => navigator.clipboard.readText());
  await page.goto('/');

  await page.getByRole('button', { name: 'Copy the install command' }).click();
  expect(await clipboard()).toBe('pnpm add react-rewards');
  await page.getByRole('button', { name: 'Copy the example' }).click();
  expect(await clipboard()).toContain('useReward(ref, confetti);');
});

test('Getting started fits a phone without scrolling sideways', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
  ).toBe(0);
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

test("the browser's bar follows the theme", async ({ page }) => {
  await page.goto('/');
  const switcher = page.getByTestId('theme');
  expect(await themeColors(page)).toEqual(['#ffffff', '#0a0a0b']);

  await switcher.click();
  await expect(switcher).toHaveText('Theme: Light');
  await expect.poll(() => themeColors(page)).toEqual(['#ffffff', '#ffffff']);

  await switcher.click();
  await expect(switcher).toHaveText('Theme: Dark');
  await expect.poll(() => themeColors(page)).toEqual(['#0a0a0b', '#0a0a0b']);

  await switcher.click();
  await expect(switcher).toHaveText('Theme: System');
  await expect.poll(() => themeColors(page)).toEqual(['#ffffff', '#0a0a0b']);
});

test('the icons and the share card are served', async ({ page, request }) => {
  await page.goto('/');
  const icons = await page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLLinkElement>(
        'link[rel="icon"], link[rel="apple-touch-icon"]'
      ),
    ].map((link) => link.href)
  );
  expect(icons).toHaveLength(3);
  // The card's URL names the deployed site, so the build is checked for the
  // same file.
  const card = await page
    .locator('meta[property="og:image"]')
    .getAttribute('content');
  const file = new URL(card ?? '').pathname.replace(/^\/react-rewards/, '');
  for (const url of [...icons, file]) {
    expect((await request.get(url)).ok(), url).toBe(true);
  }
});

test('only the fixture page is kept out of search results', async ({
  page,
}) => {
  const robots = page.locator('meta[name="robots"]');
  await page.goto('/');
  await expect(robots).toHaveCount(0);
  await page.goto('/fixtures.html');
  await expect(robots).toHaveAttribute('content', 'noindex');
});
