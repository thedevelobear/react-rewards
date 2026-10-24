import { Icon } from '@/components/icon';
import type { PagerProps } from './types';
import './style.css';

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
          <Icon name="arrow-left" size={18} />
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
          <Icon name="arrow-right" size={18} />
        </a>
      )}
    </nav>
  );
};
