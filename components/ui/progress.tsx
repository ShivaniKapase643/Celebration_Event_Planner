export function ProgressBar({ value, max = 100, className = '' }: { value: number; max?: number; className?: string; }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={['h-2.5 w-full overflow-hidden rounded-full bg-muted', className].join(' ')} aria-label="Progress">
      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all" style={{ width: `${width}%` }} />
    </div>
  );
}
