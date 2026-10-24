import { ARROW_RIGHT, Icon } from '@/components/icon';
import './style.css';

export interface PagerLink {
  /** The URL hash, without its `#`. */
  readonly name: string;
  readonly label: string;
}

interface PagerProps {
  /** Every page, in the sidebar's order. */
  readonly pages: readonly PagerLink[];
  /** The name of the page that is showing. */
  readonly current: string;
}

const ARROW_LEFT = ['M19 12H5', 'm11 18-6-6 6-6'];

/**
 * Cards for the pages before and after this one, in the sidebar's order
 * (README, "Pager").
 */
export const Pager = ({ pages, current }: PagerProps) => {
  const index = pages.findIndex((page) => page.name === current);
  const previous = index > 0 ? pages[index - 1] : undefined;
  const next = index >= 0 ? pages[index + 1] : undefined;
  return (
    <nav className="pager" aria-label="Previous and next">
      {previous && (
        <a className="pager-link" href={`#${previous.name}`} rel="prev">
          <Icon paths={ARROW_LEFT} size={18} />
          <span className="pager-text">
            <span className="pager-direction">Previous</span>
            <span className="pager-label">{previous.label}</span>
          </span>
        </a>
      )}
      {next && (
        <a className="pager-link pager-next" href={`#${next.name}`} rel="next">
          <span className="pager-text">
            <span className="pager-direction">Next</span>
            <span className="pager-label">{next.label}</span>
          </span>
          <Icon paths={ARROW_RIGHT} size={18} />
        </a>
      )}
    </nav>
  );
};
