import type { ICON_PATHS } from './paths';

/** The name of an icon in `ICON_PATHS`. */
export type IconName = keyof typeof ICON_PATHS;

export interface IconProps {
  readonly name: IconName;
  /** The width and height in CSS pixels. */
  readonly size?: number;
  readonly strokeWidth?: number;
}
