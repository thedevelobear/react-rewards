/** The package managers the install command is shown for. */
export const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export interface UsePackageManagerResult {
  readonly manager: PackageManager;
  readonly setManager: (manager: PackageManager) => void;
}
