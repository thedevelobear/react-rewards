import { useId } from 'react';
import type { SectionProps } from './types';
import './style.css';

/**
 * A titled part of a page, labelled by its heading. Paragraphs and lists
 * directly inside it are set as prose (README, "Articles").
 */
export const Section = ({ title, action, children }: SectionProps) => {
  const heading = useId();
  const titleElement = (
    <h2 id={heading} className="section-title">
      {title}
    </h2>
  );
  return (
    <section className="section" aria-labelledby={heading}>
      {action ? (
        <div className="section-head">
          {titleElement}
          {action}
        </div>
      ) : (
        titleElement
      )}
      {children}
    </section>
  );
};
