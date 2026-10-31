import * as React from 'react';

export function Dialog({ open, onOpenChange, title, children }: { open: boolean; onOpenChange: (value: boolean) => void; title: string; children: React.ReactNode; }) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('keydown', handleKey);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" aria-modal="true" role="dialog" aria-labelledby="dialog-title">
      <div ref={ref} tabIndex={-1} className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl outline-none">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="dialog-title" className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg px-2 py-1 text-lg hover:bg-muted" aria-label="Close dialog">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
