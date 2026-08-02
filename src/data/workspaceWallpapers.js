import { DEFAULT_WALLPAPER, getWallpaper } from './wallpapers';
import { getJsonPref, getPref, setJsonPref } from '../utils/prefs';

export const WORKSPACE_COUNT = 5;
const MAP_KEY = 'workspaceWallpapers';
const LEGACY_KEY = 'wallpaper';

/** A pleasant default rice per workspace so a fresh desktop is not monotone. */
const SEED = {
  1: 'tokyo-night-skyline',
  2: 'catppuccin-peaks',
  3: 'gruvbox-sun',
  4: 'nord-aurora',
  5: 'rose-pine-dawn',
};

/**
 * Coerce an arbitrary stored value into a valid `{ [ws]: wallpaperId }` map:
 * every workspace 1..N present, every id resolvable (unknown ids fall back).
 * @param {unknown} raw
 * @param {string} [fill] wallpaper id for workspaces the raw value omits
 */
export function normalizeMap(raw, fill = DEFAULT_WALLPAPER) {
  const out = {};
  for (let ws = 1; ws <= WORKSPACE_COUNT; ws += 1) {
    const wanted = raw && typeof raw === 'object' ? raw[ws] : undefined;
    out[ws] = getWallpaper(wanted ?? SEED[ws] ?? fill).id;
  }
  return out;
}

/**
 * Load the per-workspace wallpaper map. Migrates a legacy single-wallpaper
 * preference (every workspace inherits it) the first time.
 */
export function loadWorkspaceWallpapers() {
  const stored = getJsonPref(MAP_KEY, null);
  if (stored) return normalizeMap(stored);

  const legacy = getPref(LEGACY_KEY, null);
  if (legacy) {
    const migrated = {};
    for (let ws = 1; ws <= WORKSPACE_COUNT; ws += 1) migrated[ws] = legacy;
    return normalizeMap(migrated, legacy);
  }
  return normalizeMap(null);
}

/** Persist the per-workspace wallpaper map. */
export function saveWorkspaceWallpapers(map) {
  return setJsonPref(MAP_KEY, map);
}
