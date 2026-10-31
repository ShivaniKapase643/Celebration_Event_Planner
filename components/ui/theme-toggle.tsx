'use client';

import * as React from 'react';

export function ThemeToggle() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem('celebrate-ai-theme');
      const enabled = stored ? stored === 'dark' : document.documentElement.classList.contains('dark');
      document.documentElement.classList.toggle('dark', enabled);
      setDark(enabled);
    } catch {
      setDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggle = () => {
    const enabled = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', enabled);
    try {
      window.localStorage.setItem('celebrate-ai-theme', enabled ? 'dark' : 'light');
    } catch {
      // Theme still switches for this page when storage is unavailable.
    }
    setDark(enabled);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={dark}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-lg text-foreground shadow-sm transition hover:bg-muted"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
