import { CopyButton } from '@/components/copy-button';
import {
  PACKAGE_MANAGERS,
  type PackageManager,
  usePackageManager,
} from '@/hooks/use-package-manager';
import './style.css';

const COMMANDS: Record<PackageManager, string> = {
  pnpm: 'pnpm add react-rewards',
  npm: 'npm install react-rewards',
  yarn: 'yarn add react-rewards',
  bun: 'bun add react-rewards',
};

/**
 * The install command, with a switch for the package manager (README,
 * "Getting started").
 */
export const InstallCommand = () => {
  const { manager, setManager } = usePackageManager();
  const command = COMMANDS[manager];
  return (
    <div className="panel">
      <fieldset className="install-managers" aria-label="Package manager">
        {PACKAGE_MANAGERS.map((name) => (
          <button
            key={name}
            type="button"
            className="install-manager"
            aria-pressed={name === manager}
            onClick={() => setManager(name)}
          >
            {name}
          </button>
        ))}
      </fieldset>
      <div className="install-panel">
        <span className="install-prompt" aria-hidden="true">
          $
        </span>
        <code className="install-command" data-testid="install-command">
          {command}
        </code>
        <CopyButton text={command} label="the install command" />
      </div>
    </div>
  );
};
