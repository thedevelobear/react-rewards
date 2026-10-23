import type { ComponentType } from 'react';
import { type Theme, useTheme } from '@/hooks/use-theme';
import { DarkIcon, LightIcon, SystemIcon } from './icons';
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

const ICON: Record<Theme, ComponentType> = {
  system: SystemIcon,
  light: LightIcon,
  dark: DarkIcon,
};

/** One button that cycles the theme: system, light, dark (plan step 3). */
export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const Icon = ICON[theme];
  return (
    <button
      type="button"
      className="theme-switcher"
      data-testid="theme"
      title={`Switch to the ${LABEL[NEXT[theme]].toLowerCase()} theme`}
      onClick={() => setTheme(NEXT[theme])}
    >
      <Icon />
      <span className="theme-switcher-hidden">Theme: </span>
      {LABEL[theme]}
    </button>
  );
};
