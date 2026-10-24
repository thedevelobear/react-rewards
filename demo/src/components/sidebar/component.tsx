import { useId } from 'react';
import { Icon } from '@/components/icon';
import './style.css';

export interface SidebarLink {
  /** The URL hash, without its `#`. */
  readonly name: string;
  readonly label: string;
  /** Path data on a 24px grid. */
  readonly icon: readonly string[];
}

export interface SidebarGroup {
  readonly heading: string;
  readonly links: readonly SidebarLink[];
}

interface SidebarProps {
  readonly groups: readonly SidebarGroup[];
  /** The name of the page that is showing. */
  readonly current: string;
}

/** One group's heading and links. The heading labels the list. */
const Group = ({
  group: { heading, links },
  current,
}: {
  readonly group: SidebarGroup;
  readonly current: string;
}) => {
  const id = useId();
  return (
    <div className="sidebar-group">
      <p id={id} className="sidebar-heading">
        {heading}
      </p>
      <ul className="sidebar-list" aria-labelledby={id}>
        {links.map(({ name, label, icon }) => (
          <li key={name}>
            <a
              href={`#${name}`}
              className="sidebar-item"
              aria-current={name === current ? 'page' : undefined}
            >
              <Icon paths={icon} />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Links to each page's hash, in groups (README, "Header and sidebar"). */
export const Sidebar = ({ groups, current }: SidebarProps) => (
  <nav className="sidebar" aria-label="Pages">
    {groups.map((group) => (
      <Group key={group.heading} group={group} current={current} />
    ))}
  </nav>
);
