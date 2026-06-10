'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Hydration-safe: render a same-size placeholder until mounted
  if (!mounted) {
    return (
      <span
        className="inline-flex h-11 w-11 items-center justify-center rounded-full"
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-on-surface-muted transition-colors hover:bg-surface-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
