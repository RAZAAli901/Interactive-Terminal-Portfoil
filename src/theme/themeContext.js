import { createContext, useContext } from 'react';

/** Shared theme context. Kept in its own module so component files can be
 *  fast-refreshed (a file must only export components for React Refresh). */
export const ThemeContext = createContext(null);

/** Access the active theme and setter. Must be used within <ThemeProvider>. */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
