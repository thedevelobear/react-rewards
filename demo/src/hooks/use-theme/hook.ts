import { useCallback, useState } from 'react';
import type { Theme, UseThemeResult } from './types';

/**
 * Where the choice is stored. The pre-paint script in `index.html` reads the
 * same key. GitHub Pages serves every project of an account from one origin,
 * so the key is namespaced.
 */
const STORAGE_KEY = 'react-rewards:theme';

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

  return { theme, setTheme };
};
