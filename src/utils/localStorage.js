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

/**
 * Caches data with an expiration timestamp
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttlMs - Time to live in milliseconds
 */
export function setCachedData(key, data, ttlMs = 3600000 /* 1 hour */) {
  try {
    const item = {
      data,
      expiry: Date.now() + ttlMs
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    console.warn(`Failed to cache data for key ${key}`, e);
  }
}

/**
 * Retrieves cached data if it exists and hasn't expired
 * @param {string} key - Cache key
 * @returns {any|null} - The cached data or null if expired/missing
 */
export function getCachedData(key) {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch (e) {
    console.warn(`Failed to read cached data for key ${key}`, e);
    return null;
  }
}
