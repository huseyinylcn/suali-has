import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { applyThemeClass, getStoredTheme, setStoredTheme } from '../../lib/theme';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return getStoredTheme() === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const mode = isDark ? 'dark' : 'light';
    try {
      setStoredTheme(mode);
      applyThemeClass(mode);
    } catch {
      // ignore
    }
  }, [isDark]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={() => setIsDark((d) => !d)}
      title={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
        border border-[var(--gh-navbar-border)] transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-[var(--gh-primary)] focus:ring-offset-1
        ${isDark ? 'bg-[var(--gh-primary)]' : 'bg-[var(--gh-canvas-subtle)]'}
      `}
    >
      {/* Thumb */}
      <span
        className={`
          inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow
          transition-transform duration-200
          ${isDark ? 'translate-x-[24px]' : 'translate-x-[2px]'}
        `}
      >
        {isDark
          ? <Moon className="h-2.5 w-2.5 text-slate-600" />
          : <Sun className="h-2.5 w-2.5 text-amber-500" />
        }
      </span>
    </button>
  );
}
