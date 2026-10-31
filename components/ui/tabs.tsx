import * as React from 'react';

export type TabItem = { value: string; label: string; };

export function Tabs({ tabs, value, onValueChange, className = '' }: { tabs: TabItem[]; value: string; onValueChange: (value: string) => void; className?: string; }) {
  return (
    <div className={['flex flex-wrap gap-2 rounded-2xl bg-muted/60 p-1', className].join(' ')} role="tablist" aria-label="Planner tabs">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          type="button"
          aria-selected={value === tab.value}
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
