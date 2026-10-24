import type { IconName } from '@/components/icon';

export interface SidebarLink {
  /** The URL hash, without its `#`. */
  readonly name: string;
  readonly label: string;
  readonly icon: IconName;
}

export interface SidebarGroup {
  readonly heading: string;
  readonly links: readonly SidebarLink[];
}

export interface SidebarProps {
  readonly groups: readonly SidebarGroup[];
  /** The name of the page that is showing. */
  readonly current: string;
}

export interface GroupProps {
  readonly group: SidebarGroup;
  /** The name of the page that is showing. */
  readonly current: string;
}
