/**
 * Application table for the riced desktop.
 *
 * `title`, `color` and the default floating size come straight from the design
 * handoff. `color` is the window's identity: it tints the title-bar dot, the
 * dock pill and the focus ring.
 *
 * The first seven entries are the design's first-class apps (and the ones the
 * left launcher column shows). The rest are the portfolio's existing apps, kept
 * launchable from the wofi-style search launcher (Super+D) so nothing that
 * worked before disappeared.
 */

export const RICE_APPS = {
  // ── design handoff apps ──────────────────────────────────────────────────
  terminal: { title: 'raza@arch: ~', color: '#7dcfff', w: 580, h: 400, exec: 'kitty', primary: true },
  files: { title: 'Files', color: '#e0af68', w: 620, h: 420, exec: 'thunar', primary: true },
  browser: { title: 'Firefox', color: '#f7768e', w: 760, h: 540, exec: 'firefox', primary: true },
  code: { title: 'rag_pipeline.py — Code', color: '#7aa2f7', w: 740, h: 500, exec: 'code', primary: true },
  about: { title: 'about.md', color: '#bb9af7', w: 540, h: 470, exec: 'about', primary: true },
  projects: { title: 'projects', color: '#9ece6a', w: 600, h: 480, exec: 'projects', primary: true },
  power: { title: 'logout', color: '#f7768e', w: 380, h: 260, exec: 'wlogout' },

  // ── existing portfolio apps (launcher-only) ──────────────────────────────
  settings: { title: 'Settings', color: '#7dcfff', w: 780, h: 560, exec: 'nwg-look' },
  editor: { title: 'Text Editor', color: '#9ece6a', w: 680, h: 520, exec: 'gnome-text-editor' },
  images: { title: 'Image Viewer', color: '#bb9af7', w: 760, h: 540, exec: 'imv' },
  chat: { title: 'Discord', color: '#7aa2f7', w: 760, h: 560, exec: 'discord' },
  calculator: { title: 'Calculator', color: '#e0af68', w: 340, h: 500, exec: 'gnome-calculator' },
  clock: { title: 'Clocks', color: '#7dcfff', w: 460, h: 420, exec: 'gnome-clocks' },
  solitaire: { title: 'AisleRiot Solitaire', color: '#9ece6a', w: 720, h: 560, exec: 'sol' },
  minesweeper: { title: 'Mines', color: '#f7768e', w: 420, h: 520, exec: 'gnome-mines' },
};

/** Apps offered by the wofi-style search launcher. */
export const LAUNCHABLE = Object.entries(RICE_APPS)
  .filter(([id]) => id !== 'power')
  .map(([id, def]) => ({ id, name: def.title, exec: def.exec, color: def.color }));

/** Window title for an app id, falling back to the raw id. */
export function appTitle(id) {
  return RICE_APPS[id]?.title || id;
}

/** Identity colour for an app id. */
export function appColor(id) {
  return RICE_APPS[id]?.color || '#7aa2f7';
}
