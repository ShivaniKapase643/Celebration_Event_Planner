import * as React from 'react';

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string; }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
      <span>{label}</span>
    </label>
  );
}

export function ChipToggle({ pressed, onPressed, label }: { pressed: boolean; onPressed: () => void; label: string; }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onPressed}
      className={[
        'rounded-full border px-3 py-2 text-sm font-medium transition',
        pressed ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-muted'
      ].join(' ')}
    >
      {label}
    </button>
  );
}
