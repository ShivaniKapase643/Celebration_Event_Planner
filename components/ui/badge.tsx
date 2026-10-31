import * as React from 'react';

export function Badge({ className = '', children }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={['inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary', className].join(' ')}>
      {children}
    </span>
  );
}
