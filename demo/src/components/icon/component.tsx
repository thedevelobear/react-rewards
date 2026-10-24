import { ICON_PATHS } from './paths';
import type { IconProps } from './types';

/** A stroke icon. Text beside it names it, so it is hidden. */
export const Icon = ({ name, size = 16, strokeWidth = 2 }: IconProps) => (
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
    {ICON_PATHS[name].map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);
