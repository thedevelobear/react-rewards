import { useId } from 'react';
import { Icon } from '@/components/icon';
import type { GroupProps, SidebarProps } from './types';
import './style.css';

/** One group's heading and links. The heading labels the list. */
const Group = ({ group: { heading, links }, current }: GroupProps) => {
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
              <Icon name={icon} />
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
