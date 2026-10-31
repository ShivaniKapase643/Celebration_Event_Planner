import * as React from 'react';

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-violet-700 shadow-soft',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-violet-100 dark:hover:bg-slate-800',
  ghost: 'bg-transparent text-foreground hover:bg-muted/80',
  danger: 'bg-rose-600 text-white hover:bg-rose-700'
} as const;

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base'
} as const;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
};

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60',
        variants[variant],
        sizes[size],
        className
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
