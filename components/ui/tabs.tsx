"use client";

import * as React from 'react';
import { useRef } from 'react';

export type TabItem = { value: string; label: string; };

export function Tabs({ tabs, value, onValueChange, className = '' }: { tabs: TabItem[]; value: string; onValueChange: (value: string) => void; className?: string; }) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const moveFocus = (index: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const nextIndex = (index + direction + tabs.length) % tabs.length;
    onValueChange(tabs[nextIndex].value);
    tabRefs.current[nextIndex]?.focus();
  };
  return (
    <div className={['flex flex-wrap gap-2 rounded-2xl bg-muted/60 p-1', className].join(' ')} role="tablist" aria-label="Planner tabs">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          type="button"
          aria-selected={value === tab.value}
          tabIndex={value === tab.value ? 0 : -1}
          ref={(element) => { tabRefs.current[tabs.indexOf(tab)] = element; }}
          onKeyDown={moveFocus(tabs.indexOf(tab))}
          className={[
            'rounded-xl px-3 py-2 text-sm font-medium transition',
            value === tab.value ? 'bg-card text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:bg-background'
          ].join(' ')}
          onClick={() => onValueChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
