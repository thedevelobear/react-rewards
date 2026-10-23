import './style.css';

interface PageTitleProps {
  readonly title: string;
  readonly description: string;
}

/** The effect's name on a gradient band, and a line about it (ADR 0050). */
export const PageTitle = ({ title, description }: PageTitleProps) => (
  <div className="page-title">
    <h1 className="page-title-heading">
      <span className="page-title-band">{title}</span>
    </h1>
    <p className="page-title-description">{description}</p>
  </div>
);
