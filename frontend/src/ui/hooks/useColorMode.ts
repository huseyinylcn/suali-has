import { useEffect, useState } from 'react';

export type ColorMode = 'dark' | 'light';

export function useColorMode(): ColorMode {
  const [mode, setMode] = useState<ColorMode>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setMode(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return mode;
}
