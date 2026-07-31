import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_THEME, THEMES, getTheme, toCssVars } from './themes';

const STORAGE_KEY = 'hypr_theme';

const ThemeContext = createContext(null);

function readStoredTheme() {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return id && THEMES[id] ? id : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** Apply a theme's CSS variables to the document root. */
function applyThemeVars(themeId) {
  const theme = getTheme(themeId);
  const root = document.documentElement;
  const vars = toCssVars(theme);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
  root.dataset.theme = theme.id;
  root.style.colorScheme = theme.dark ? 'dark' : 'light';
  return theme;
}

/**
 * Provides the active shell theme and a `setTheme(id)` setter. Theme changes
 * flow to CSS custom properties on :root, so every surface restyles instantly.
 */
export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(readStoredTheme);

  useEffect(() => {
    applyThemeVars(themeId);
    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch {
      /* storage unavailable — theme still applies for the session */
    }
  }, [themeId]);

  const setTheme = useCallback((id) => {
    if (THEMES[id]) setThemeId(id);
  }, []);

  const value = useMemo(
    () => ({ themeId, theme: getTheme(themeId), setTheme }),
    [themeId, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Access the active theme and setter. Must be used within <ThemeProvider>. */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
