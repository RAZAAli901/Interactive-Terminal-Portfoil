/**
 * Tiny localStorage-backed preference store.
 *
 * Every read and write is guarded: private-mode browsers and disabled storage
 * throw on access, and a portfolio should degrade to session-only preferences
 * rather than fail to boot.
 */

const PREFIX = 'hypr_';

/** Read a stored preference, falling back when missing or unreadable. */
export function getPref(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : raw;
  } catch {
    return fallback;
  }
}

/** Persist a preference. Silently no-ops when storage is unavailable. */
export function setPref(key, value) {
  try {
    localStorage.setItem(PREFIX + key, String(value));
  } catch {
    /* storage unavailable — the value still applies for this session */
  }
  return value;
}

/** Remove a stored preference. */
export function clearPref(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* nothing to do */
  }
}
