import { type KeyboardEvent, useId, useState } from 'react';
import type { TabsProps } from './types';
import './style.css';

/** The tab `key` moves to from `index` of `count` tabs, if it moves. */
const move = (key: string, index: number, count: number) => {
  switch (key) {
    case 'ArrowLeft':
      return (index - 1 + count) % count;
    case 'ArrowRight':
      return (index + 1) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
};

/**
 * The WAI-ARIA tabs pattern. Every panel stays mounted, and the ones not
 * shown are `hidden`, so leaving a tab doesn't unmount what it holds
 * (README, "Preview and Code tabs").
 */
export const Tabs = ({ label, tabs }: TabsProps) => {
  const base = useId();
  const [selected, setSelected] = useState(0);
  const tabId = (index: number) => `${base}-tab-${index}`;
  const panelId = (index: number) => `${base}-panel-${index}`;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next = move(event.key, selected, tabs.length);
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    document.getElementById(tabId(next))?.focus();
  };

  return (
    <div className="tabs">
      <div className="tabs-list" role="tablist" aria-label={label}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={tabId(index)}
            type="button"
            role="tab"
            className="tabs-tab"
            aria-selected={index === selected}
            aria-controls={panelId(index)}
            tabIndex={index === selected ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={onKeyDown}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          id={panelId(index)}
          role="tabpanel"
          className="tabs-panel"
          aria-labelledby={tabId(index)}
          hidden={index !== selected}
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
};
