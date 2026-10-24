interface IconProps {
  /** Path data on a 24px grid, drawn as strokes. */
  readonly paths: readonly string[];
  /** The width and height in CSS pixels. */
  readonly size?: number;
  readonly strokeWidth?: number;
}

/** A stroke icon. Text beside it names it, so it is hidden. */
export const Icon = ({ paths, size = 16, strokeWidth = 2 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {paths.map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);
