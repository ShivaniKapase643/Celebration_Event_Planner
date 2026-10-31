import * as React from 'react';

export type ToastItem = {
  id: string;
  title: string;
};

export function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  if (!toasts.length) return null;

  return (
    <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(90vw,22rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-soft">
          {toast.title}
        </div>
      ))}
    </div>
  );
}
