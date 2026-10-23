import { ThemeSwitcher } from '@/components/theme-switcher';
import { gettingStarted } from '@/data/guides';
import { GitHubIcon } from './icons';
import logo from './logo.png';
import './style.css';

const REPOSITORY = 'https://github.com/thedevelobear/react-rewards';

/** The logo, a link to the repository and the theme switcher. */
export const Header = () => (
  <header className="header">
    {/* The logo goes home (ADR 0055). */}
    <a className="header-logo" href={`#${gettingStarted.name}`}>
      <img src={logo} alt="react-rewards" width={265} height={56} />
    </a>
    <div className="header-actions">
      <a
        className="header-link"
        href={REPOSITORY}
        aria-label="react-rewards on GitHub"
        title="GitHub"
      >
        <GitHubIcon />
      </a>
      <ThemeSwitcher />
    </div>
  </header>
);
