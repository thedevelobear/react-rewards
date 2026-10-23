import { ThemeSwitcher } from '@/components/theme-switcher';
import { effects } from '@/data/effects';
import { GitHubIcon } from './icons';
import logo from './logo.png';
import './style.css';

const REPOSITORY = 'https://github.com/thedevelobear/react-rewards';

/** The logo, a link to the repository and the theme switcher. */
export const Header = () => (
  <header className="header">
    {/* The first effect stands in for a home page (ADR 0047). */}
    <a className="header-logo" href={`#${effects[0].name}`}>
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
