import { Icon, type IconName } from '@/components/icon';
import { type Theme, useTheme } from '@/hooks/use-theme';
import './style.css';

const NEXT: Record<Theme, Theme> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

const LABEL: Record<Theme, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

const ICON: Record<Theme, IconName> = {
  system: 'monitor',
  light: 'sun',
  dark: 'moon',
};

/**
 * One icon button that cycles the theme: system, light, dark (README,
 * "Header and sidebar").
 */
export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  return (
    <button
      type="button"
      className="theme-switcher"
      data-testid="theme"
      title={`Switch to the ${LABEL[NEXT[theme]].toLowerCase()} theme`}
      onClick={() => setTheme(NEXT[theme])}
    >
      <Icon name={ICON[theme]} size={17} />
      <span className="theme-switcher-hidden">Theme: {LABEL[theme]}</span>
    </button>
  );
};
