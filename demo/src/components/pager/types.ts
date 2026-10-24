export interface PagerLink {
  /** The URL hash, without its `#`. */
  readonly name: string;
  readonly label: string;
}

export interface PagerProps {
  /** Every page, in the sidebar's order. */
  readonly pages: readonly PagerLink[];
  /** The name of the page that is showing. */
  readonly current: string;
}
