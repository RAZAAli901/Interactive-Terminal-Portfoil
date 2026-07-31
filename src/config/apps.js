/**
 * Central application registry for the Hyprland shell.
 *
 * Replaces the inline `initialWindows` map that previously lived in App.jsx.
 * Each entry carries its Linux-authentic identity plus metadata the shell needs:
 * launcher category, whether it spawns floating, default geometry, and an
 * `enabled` flag so Windows-only apps can be curated out without deleting code.
 */

export const CATEGORIES = {
  system: 'System',
  dev: 'Development',
  media: 'Media',
  utility: 'Utilities',
  game: 'Games',
  legacy: 'Legacy',
};

/**
 * @typedef {object} AppDef
 * @property {string} id            stable key (matches renderWindowContent switch)
 * @property {string} name          Linux app name shown in title/launcher
 * @property {string} exec          fake exec command (used by launcher search + fastfetch)
 * @property {string} icon          emoji/glyph placeholder (swapped for real icons in P5)
 * @property {keyof typeof CATEGORIES} category
 * @property {boolean} enabled      registered + launchable
 * @property {boolean} desktop      show as a desktop shortcut
 * @property {boolean} floating     spawn floating instead of tiled
 * @property {number} width         default floating width
 * @property {number} height        default floating height
 * @property {number} [offsetX]
 * @property {number} [offsetY]
 * @property {string} [legacyId]    original component id if renamed
 */

/** @type {Record<string, AppDef>} */
export const APPS = {
  // ── System / core ─────────────────────────────────────────────────────────
  terminal: {
    id: 'terminal', name: 'kitty', exec: 'kitty', icon: '\u{1F5A5}️',
    category: 'system', enabled: true, desktop: true, floating: false,
    width: 820, height: 520, offsetX: 0, offsetY: 0,
  },
  files: {
    id: 'files', name: 'Files', exec: 'thunar', icon: '\u{1F4C1}',
    category: 'system', enabled: true, desktop: true, floating: false,
    width: 860, height: 540, legacyId: 'explorer',
  },
  settings: {
    id: 'settings', name: 'Settings', exec: 'nwg-look', icon: '⚙️',
    category: 'system', enabled: true, desktop: false, floating: true,
    width: 780, height: 560,
  },

  // ── Development ────────────────────────────────────────────────────────────
  code: {
    id: 'code', name: 'Visual Studio Code', exec: 'code', icon: '\u{1F4D8}',
    category: 'dev', enabled: true, desktop: true, floating: false,
    width: 960, height: 620, legacyId: 'vscode',
  },
  editor: {
    id: 'editor', name: 'Text Editor', exec: 'gnome-text-editor', icon: '\u{1F4DD}',
    category: 'dev', enabled: true, desktop: false, floating: true,
    width: 680, height: 520, legacyId: 'notepad',
  },

  // ── Media / internet ───────────────────────────────────────────────────────
  firefox: {
    id: 'firefox', name: 'Firefox', exec: 'firefox', icon: '\u{1F98A}',
    category: 'media', enabled: true, desktop: true, floating: false,
    width: 980, height: 640, legacyId: 'browser',
  },
  images: {
    id: 'images', name: 'Image Viewer', exec: 'imv', icon: '\u{1F5BC}️',
    category: 'media', enabled: true, desktop: false, floating: true,
    width: 760, height: 540, legacyId: 'photos',
  },
  chat: {
    id: 'chat', name: 'Discord', exec: 'discord', icon: '\u{1F4AC}',
    category: 'media', enabled: true, desktop: false, floating: false,
    width: 760, height: 560,
  },

  // ── Utilities ──────────────────────────────────────────────────────────────
  calculator: {
    id: 'calculator', name: 'Calculator', exec: 'gnome-calculator', icon: '\u{1F9EE}',
    category: 'utility', enabled: true, desktop: false, floating: true,
    width: 340, height: 500,
  },
  clock: {
    id: 'clock', name: 'Clocks', exec: 'gnome-clocks', icon: '⏰',
    category: 'utility', enabled: true, desktop: false, floating: true,
    width: 460, height: 420,
  },

  // ── Games (kept, launcher-only, off desktop) ──────────────────────────────
  solitaire: {
    id: 'solitaire', name: 'AisleRiot Solitaire', exec: 'sol', icon: '\u{1F0CF}',
    category: 'game', enabled: true, desktop: false, floating: true,
    width: 720, height: 560,
  },
  minesweeper: {
    id: 'minesweeper', name: 'Mines', exec: 'gnome-mines', icon: '\u{1F4A3}',
    category: 'game', enabled: true, desktop: false, floating: true,
    width: 420, height: 520,
  },

  // ── Legacy Windows-only apps (disabled by default, not deleted) ────────────
  word: { id: 'word', name: 'Word', exec: 'libreoffice --writer', icon: '\u{1F4DD}', category: 'legacy', enabled: false, desktop: false, floating: false, width: 760, height: 560 },
  excel: { id: 'excel', name: 'Calc', exec: 'libreoffice --calc', icon: '\u{1F4CA}', category: 'legacy', enabled: false, desktop: false, floating: false, width: 820, height: 520 },
  powerpoint: { id: 'powerpoint', name: 'Impress', exec: 'libreoffice --impress', icon: '\u{1F534}', category: 'legacy', enabled: false, desktop: false, floating: false, width: 820, height: 560 },
  outlook: { id: 'outlook', name: 'Thunderbird', exec: 'thunderbird', icon: '\u{1F4E7}', category: 'legacy', enabled: false, desktop: false, floating: false, width: 860, height: 560 },
  onenote: { id: 'onenote', name: 'Notes', exec: 'gnome-notes', icon: '\u{1F4D3}', category: 'legacy', enabled: false, desktop: false, floating: false, width: 760, height: 520 },
  store: { id: 'store', name: 'Software', exec: 'gnome-software', icon: '\u{1F6CD}️', category: 'legacy', enabled: false, desktop: false, floating: false, width: 920, height: 620 },
  snipping: { id: 'snipping', name: 'Screenshot', exec: 'grim', icon: '✂️', category: 'legacy', enabled: false, desktop: false, floating: true, width: 620, height: 460 },
};

/** Apps that are enabled, i.e. registered and launchable. */
export function enabledApps() {
  return Object.values(APPS).filter((a) => a.enabled);
}

/** Apps that get a desktop shortcut. */
export function desktopApps() {
  return Object.values(APPS).filter((a) => a.enabled && a.desktop);
}

/** Enabled apps grouped by category, in CATEGORIES order. */
export function appsByCategory() {
  const groups = {};
  for (const key of Object.keys(CATEGORIES)) groups[key] = [];
  for (const app of enabledApps()) groups[app.category]?.push(app);
  return groups;
}
