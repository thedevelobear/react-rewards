import { useEffect, useMemo, useState } from 'react';
import { CopyButton } from '@/components/copy-button';
import { Icon } from '@/components/icon';
import { highlighter, loadHighlighter, THEME } from './highlight';
import type { CodeBlockProps, Line } from './types';
import './style.css';

/** `code` split into lines of one uncoloured token each. */
const plain = (code: string): Line[] => {
  let offset = 0;
  return code.split('\n').map((content) => {
    const line = { offset, tokens: [{ offset, content }] };
    offset += content.length + 1;
    return line;
  });
};

/**
 * The code under its file name, with line numbers, highlighted by shiki once
 * it has loaded, and plain until then (README, "Code colours").
 */
export const CodeBlock = ({ code, filename, label }: CodeBlockProps) => {
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
    <div className="panel">
      <div className="code-block-head">
        <Icon name="file" size={14} />
        <span className="code-block-file">{filename}</span>
        <span className="code-block-lang">tsx</span>
        <CopyButton text={code} label={label} />
      </div>
      <div className="code-block-body">
        {/* Beside the code rather than in it, so they aren't copied. */}
        <div className="code-block-numbers" aria-hidden="true">
          {lines.map((line, index) => (
            <span key={line.offset}>{index + 1}</span>
          ))}
        </div>
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
      </div>
    </div>
  );
};
