export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'sualihas-theme';

export function getStoredTheme(): ThemeMode {
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'light' || v === 'dark') return v;
  return 'light';
}

export function setStoredTheme(mode: ThemeMode) {
  localStorage.setItem(STORAGE_KEY, mode);
}

export function applyThemeClass(resolved: ThemeMode) {
  const root = document.documentElement;
  if (resolved === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function initTheme() {
  applyThemeClass(getStoredTheme());
}
