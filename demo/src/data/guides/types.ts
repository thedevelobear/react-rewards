/** A page of the site that isn't an effect (README, "Getting started"). */
export interface Guide {
  /** The URL hash. */
  readonly name: string;
  /** The sidebar label and the page title. */
  readonly label: string;
  /** One line under the title. */
  readonly description: string;
}
