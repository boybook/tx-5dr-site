import { useEffect, useState } from 'react';
import { THEME_STORAGE_KEY, type ThemeMode, type ThemePreference } from '../lib/preferences';
import { removeStorage, readStorage, writeStorage } from '../lib/storage';

function getStoredThemePreference(): ThemePreference {
  const stored = readStorage(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  return 'system';
}

export function resolveTheme(preference: ThemePreference): ThemeMode {
  if (preference === 'dark' || preference === 'light') {
    return preference;
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function useTheme() {
  const [themePreference, setThemePreference] = useState<ThemePreference>(getStoredThemePreference);
  const [systemTheme, setSystemTheme] = useState<ThemeMode>(() => resolveTheme('system'));
  const theme = themePreference === 'system' ? systemTheme : themePreference;

  useEffect(() => {
    if (themePreference === 'system') {
      removeStorage(THEME_STORAGE_KEY);
    } else {
      writeStorage(THEME_STORAGE_KEY, themePreference);
    }
  }, [themePreference]);

  useEffect(() => {
    if (themePreference !== 'system' || typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return { theme, themePreference, setThemePreference };
}
