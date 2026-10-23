import type { AnyEffectPage } from '@/data/effects';
import './style.css';

interface SidebarProps {
  readonly effects: readonly AnyEffectPage[];
  /** The name of the effect on the page. */
  readonly current: string;
}

/** Links to each effect's hash (ADR 0046). */
export const Sidebar = ({ effects, current }: SidebarProps) => (
  <nav className="sidebar" aria-label="Effects">
    <p className="sidebar-heading" aria-hidden="true">
      Effects
    </p>
    <ul className="sidebar-list">
      {effects.map(({ name, label }) => (
        <li key={name}>
          <a
            href={`#${name}`}
            className="sidebar-item"
            aria-current={name === current ? 'page' : undefined}
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);
