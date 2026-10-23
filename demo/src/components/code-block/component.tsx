import { useEffect, useMemo, useState } from 'react';
import { CopyButton } from '@/components/copy-button';
import { highlighter, loadHighlighter, THEME } from './highlight';
import './style.css';

interface Token {
  /** Where the token starts in the code, which also keys it. */
  readonly offset: number;
  readonly content: string;
  /** A `--code-*` variable, or none for the foreground. */
  readonly color?: string;
}

interface Line {
  readonly offset: number;
  readonly tokens: readonly Token[];
}

/** `code` split into lines of one uncoloured token each. */
const plain = (code: string): Line[] => {
  let offset = 0;
  return code.split('\n').map((content) => {
    const line = { offset, tokens: [{ offset, content }] };
    offset += content.length + 1;
    return line;
  });
};

interface CodeBlockProps {
  /** TSX source. A trailing newline is copied but not shown. */
  readonly code: string;
  /** What the code is, for the copy button, such as "the snippet". */
  readonly label: string;
}

/**
 * reactbits' code panel, highlighted by shiki once it has loaded, and plain
 * until then (ADR 0053).
 */
export const CodeBlock = ({ code, label }: CodeBlockProps) => {
  const [shiki, setShiki] = useState(highlighter);

  useEffect(() => {
    if (shiki) return;
    let mounted = true;
    loadHighlighter().then(
      (loaded) => mounted && setShiki(loaded),
      // Without shiki, the code stays plain.
      () => undefined
    );
    return () => {
      mounted = false;
    };
  }, [shiki]);

  const shown = code.endsWith('\n') ? code.slice(0, -1) : code;
  const lines = useMemo(() => {
    const base = plain(shown);
    if (!shiki) return base;
    const { tokens } = shiki.codeToTokens(shown, { lang: 'tsx', theme: THEME });
    return base.map((line, index) => ({
      offset: line.offset,
      tokens: tokens[index] ?? line.tokens,
    }));
  }, [shiki, shown]);

  return (
    <div className="frame">
      <div className="frame-panel code-block">
        <pre className="code-block-pre" data-highlighted={shiki !== null}>
          <code>
            {lines.map((line, index) => (
              <span key={line.offset}>
                {line.tokens.map((token) => (
                  <span
                    key={token.offset}
                    style={token.color ? { color: token.color } : undefined}
                  >
                    {token.content}
                  </span>
                ))}
                {index < lines.length - 1 && '\n'}
              </span>
            ))}
          </code>
        </pre>
        <div className="code-block-actions">
          <CopyButton text={code} label={label} />
        </div>
      </div>
    </div>
  );
};
