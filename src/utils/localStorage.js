/**
 * Retrieves the command history from localStorage
 * @returns {string[]}
 */
export function getHistory() {
  try {
    const history = localStorage.getItem('terminal_history');
    if (!history) return [];
    const parsed = JSON.parse(history);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed to parse terminal history from localStorage", e);
    return [];
  }
}

/**
 * Saves command history in localStorage, capping the array at 100 items
 * @param {string[]} history 
 */
export function saveHistory(history) {
  try {
    const cappedHistory = history.slice(-100);
    localStorage.setItem('terminal_history', JSON.stringify(cappedHistory));
  } catch (e) {
    console.warn("Failed to save terminal history to localStorage", e);
  }
}

/**
 * Retrieves the active theme from localStorage
 * @returns {string}
 */
export function getThemePreference() {
  return localStorage.getItem('terminal_theme') || localStorage.getItem('theme') || 'retro';
}

/**
 * Saves the active theme in localStorage
 * @param {string} theme 
 */
export function saveThemePreference(theme) {
  try {
    localStorage.setItem('terminal_theme', theme);
    localStorage.setItem('theme', theme); // Sync with existing theme key
  } catch (e) {
    console.warn("Failed to save theme to localStorage", e);
  }
}
