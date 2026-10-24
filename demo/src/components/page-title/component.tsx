import { Icon } from '@/components/icon';
import type { PageTitleProps } from './types';
import './style.css';

/**
 * The page's group and name as a breadcrumb, its name, and a line about it
 * (README, "Page title").
 */
export const PageTitle = ({ group, title, description }: PageTitleProps) => (
  <div className="page-title">
    <nav aria-label="Breadcrumb">
      <ol className="page-title-breadcrumb">
        <li>{group}</li>
        <li aria-hidden="true">
          <Icon name="chevron-right" size={12} />
        </li>
        <li aria-current="page">{title}</li>
      </ol>
    </nav>
    <h1 className="page-title-heading">{title}</h1>
    <p className="page-title-description">{description}</p>
  </div>
);
