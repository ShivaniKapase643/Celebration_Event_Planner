import * as React from 'react';

export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={['rounded-2xl border border-border bg-card text-card-foreground shadow-soft', className].join(' ')} {...props} />;
}

export function CardHeader({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={['flex items-center justify-between gap-3 px-5 pt-5', className].join(' ')} {...props} />;
}

export function CardContent({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={['px-5 pb-5 pt-4', className].join(' ')} {...props} />;
}
