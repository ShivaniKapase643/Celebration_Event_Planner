import * as React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const inputClassName =
  'mt-2 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20';

export function Input({ className = '', ...props }: InputProps) {
  return <input className={[inputClassName, className].join(' ')} {...props} />;
}
