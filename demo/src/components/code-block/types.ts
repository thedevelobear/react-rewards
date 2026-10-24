/** One coloured run of the code. */
export interface Token {
  /** Where the token starts in the code, which also keys it. */
  readonly offset: number;
  readonly content: string;
  /** A `--code-*` variable, or none for the foreground. */
  readonly color?: string;
}

/** One line of the code, as tokens. */
export interface Line {
  readonly offset: number;
  readonly tokens: readonly Token[];
}

export interface CodeBlockProps {
  /** TSX or TypeScript source. A trailing newline is copied but not shown. */
  readonly code: string;
  /** The file the code would live in, such as `RewardButton.tsx`. */
  readonly filename: string;
  /**
   * The language in the header. Both are highlighted with the TSX grammar.
   * Defaults to `tsx`.
   */
  readonly lang?: 'tsx' | 'ts';
  /** What the code is, for the copy button, such as "the snippet". */
  readonly label: string;
}
