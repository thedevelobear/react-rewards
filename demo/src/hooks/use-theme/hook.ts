import { useCallback, useEffect, useState } from 'react';
import type { Theme, UseThemeResult } from './types';

/**
 * Where the choice is stored. The pre-paint script in `index.html` reads the
 * same key. GitHub Pages serves every project of an account from one origin,
 * so the key is namespaced.
 */
const STORAGE_KEY = 'react-rewards:theme';

/**
 * `--bg` in each theme, as in `tokens.css`. The `theme-color` tags in
 * `index.html` hold the same colours, one per `prefers-color-scheme`.
 */
const THEME_COLORS = { light: '#ffffff', dark: '#0a0a0b' } as const;

/**
 * Colours the browser's bar like the page. A light or dark choice sets both
 * `theme-color` tags, and "system" gives each its own scheme's colour back.
 */
const applyThemeColor = (theme: Theme) => {
  const tags = document.querySelectorAll<HTMLMetaElement>(
    'meta[name="theme-color"]'
  );
  for (const tag of tags) {
    const scheme = tag.media.includes('dark') ? 'dark' : 'light';
    tag.content = THEME_COLORS[theme === 'system' ? scheme : theme];
  }
};

/** The theme that the pre-paint script applied. */
const applied = (): Theme => {
  const { theme } = document.documentElement.dataset;
  return theme === 'light' || theme === 'dark' ? theme : 'system';
};

/**
 * The site's theme. A light or dark choice is set as `data-theme` on
 * `<html>` and stored. "system" removes both, and `tokens.css` follows
 * `prefers-color-scheme`.
 */
export const useTheme = (): UseThemeResult => {
  const [theme, setThemeState] = useState(applied);

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    if (next === 'system') delete root.dataset.theme;
    else root.dataset.theme = next;
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage is blocked, so the choice lasts until the page reloads.
    }
    setThemeState(next);
  }, []);

  useEffect(() => applyThemeColor(theme), [theme]);

  return { theme, setTheme };
};
