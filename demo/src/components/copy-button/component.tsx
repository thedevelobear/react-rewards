import { useEffect, useState } from 'react';
import { CheckIcon, CopyIcon } from './icons';
import './style.css';

/** How long "Copied" shows, in milliseconds. */
const CONFIRMATION = 1500;

interface CopyButtonProps {
  readonly text: string;
  /** What is copied, for screen readers, such as "the snippet". */
  readonly label: string;
}

/** Copies `text` to the clipboard, and says so for a moment. */
export const CopyButton = ({ text, label }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), CONFIRMATION);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // The clipboard is blocked, so there is nothing to confirm.
    }
  };

  return (
    <button
      type="button"
      className="copy-button"
      aria-label={`Copy ${label}`}
      onClick={copy}
    >
      {copied ? (
        <span className="copy-button-done">
          <CheckIcon />
        </span>
      ) : (
        <CopyIcon />
      )}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};
