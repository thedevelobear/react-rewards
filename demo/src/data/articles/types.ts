import type { ComponentType } from 'react';
import type { IconName } from '@/components/icon';

/**
 * A page of the site that isn't an effect: a guide, or a page of the API
 * (README, "Articles").
 */
export interface Article {
  /** The URL hash. */
  readonly name: string;
  /** The sidebar label and the page title. */
  readonly label: string;
  /** One line under the title. */
  readonly description: string;
  /** The sidebar icon. */
  readonly icon: IconName;
  /** What the page shows under its title. */
  readonly content: ComponentType;
}
