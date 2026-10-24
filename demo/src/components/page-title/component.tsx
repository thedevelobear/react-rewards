import { Icon } from '@/components/icon';
import './style.css';

interface PageTitleProps {
  /** The sidebar group the page is in, such as "Guides". */
  readonly group: string;
  readonly title: string;
  readonly description: string;
}

const CHEVRON_RIGHT = ['m9 6 6 6-6 6'];

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
          <Icon paths={CHEVRON_RIGHT} size={12} />
        </li>
        <li aria-current="page">{title}</li>
      </ol>
    </nav>
    <h1 className="page-title-heading">{title}</h1>
    <p className="page-title-description">{description}</p>
  </div>
);
