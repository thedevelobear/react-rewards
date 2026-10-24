import { Icon } from '@/components/icon';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { gettingStarted } from '@/data/guides';
import logo from './logo.png';
import './style.css';

const REPOSITORY = 'https://github.com/thedevelobear/react-rewards';

const ARROW_UP_RIGHT = ['M7 17 17 7', 'M8 7h9v9'];

/** The logo, a link to the repository and the theme switcher. */
export const Header = () => (
  <header className="header">
    <div className="header-inner">
      {/* The logo goes home (README, "Header and sidebar"). */}
      <a className="header-logo" href={`#${gettingStarted.name}`}>
        <img src={logo} alt="react-rewards" width={265} height={56} />
      </a>
      <span className="header-tag">docs</span>
      <div className="header-actions">
        <a className="header-button" href={REPOSITORY}>
          GitHub
          <Icon paths={ARROW_UP_RIGHT} size={14} />
        </a>
        <ThemeSwitcher />
      </div>
    </div>
  </header>
);
