/** The switcher's choices. "system" follows `prefers-color-scheme`. */
export type Theme = 'system' | 'light' | 'dark';

export interface UseThemeResult {
  readonly theme: Theme;
  readonly setTheme: (theme: Theme) => void;
}
