import { useCallback, useState } from 'react';
import type { PackageManager, UsePackageManagerResult } from './types';

/** The package managers the install command is shown for. */
export const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'] as const;

/** Namespaced, like the theme's key (see `use-theme`). */
const STORAGE_KEY = 'react-rewards:package-manager';

const isPackageManager = (value: unknown): value is PackageManager =>
  PACKAGE_MANAGERS.some((manager) => manager === value);

/** The stored choice, or pnpm. */
const stored = (): PackageManager => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isPackageManager(value) ? value : 'pnpm';
  } catch {
    return 'pnpm';
  }
};

/** The install command's package manager, kept across visits. */
export const usePackageManager = (): UsePackageManagerResult => {
  const [manager, setManagerState] = useState(stored);

  const setManager = useCallback((next: PackageManager) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage is blocked, so the choice lasts until the page reloads.
    }
    setManagerState(next);
  }, []);

  return { manager, setManager };
};
