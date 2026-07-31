const KEY = 'hypr_perf';

/** Read the stored performance mode ('low' disables blur + animations). */
export function getPerf() {
  try {
    return localStorage.getItem(KEY) === 'low' ? 'low' : 'normal';
  } catch {
    return 'normal';
  }
}

/** Apply a performance mode to the document root and persist it. */
export function setPerf(mode) {
  const value = mode === 'low' ? 'low' : 'normal';
  document.documentElement.dataset.perf = value;
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* storage unavailable — still applies for the session */
  }
  return value;
}

/** Apply the stored mode (call once on startup). */
export function applyStoredPerf() {
  return setPerf(getPerf());
}
