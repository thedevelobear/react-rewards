import type { CodeTextProps } from './types';

/** `text` with its backticked parts as code. */
export const CodeText = ({ text }: CodeTextProps) =>
  text
    .split('`')
    .map((part, index) =>
      index % 2 === 1 ? <code key={part}>{part}</code> : part
    );
