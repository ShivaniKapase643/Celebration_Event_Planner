import * as React from 'react';

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
      <svg viewBox="0 0 120 120" className="mb-4 h-24 w-24 text-primary/70" fill="none" aria-hidden="true">
        <rect x="18" y="22" width="84" height="68" rx="16" stroke="currentColor" strokeWidth="3" />
        <path d="M30 78L48 58L58 66L78 44L92 64V90H30V78Z" fill="currentColor" opacity="0.2" />
        <circle cx="82" cy="38" r="12" fill="currentColor" opacity="0.18" />
      </svg>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
