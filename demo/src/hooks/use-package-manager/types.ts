import type { PACKAGE_MANAGERS } from './hook';

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export interface UsePackageManagerResult {
  readonly manager: PackageManager;
  readonly setManager: (manager: PackageManager) => void;
}
