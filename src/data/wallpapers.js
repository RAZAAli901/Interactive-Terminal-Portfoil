/**
 * Wallpaper manifest.
 *
 * All twenty wallpapers are original SVG artwork authored for this project, in
 * the palettes the Linux ricing community actually uses. They are vectors, so
 * each one is a few kilobytes and stays crisp at any resolution — and because
 * they are original there is no third-party licensing attached to the repo.
 *
 * They are deliberately dark and low-contrast: translucent glass windows and the
 * neural-network canvas sit on top of them.
 */

export const WALLPAPERS = [
  { id: 'tokyo-night-skyline', name: 'Night Skyline', palette: 'Tokyo Night', file: 'tokyo-night-skyline.svg' },
  { id: 'tokyo-night-grid', name: 'Neon Grid', palette: 'Tokyo Night', file: 'tokyo-night-grid.svg' },
  { id: 'tokyo-night-stars', name: 'Starfield', palette: 'Tokyo Night', file: 'tokyo-night-stars.svg' },
  { id: 'catppuccin-mesh', name: 'Gradient Mesh', palette: 'Catppuccin Mocha', file: 'catppuccin-mesh.svg' },
  { id: 'catppuccin-peaks', name: 'Moonlit Peaks', palette: 'Catppuccin Mocha', file: 'catppuccin-peaks.svg' },
  { id: 'gruvbox-sun', name: 'Retro Sun', palette: 'Gruvbox', file: 'gruvbox-sun.svg' },
  { id: 'gruvbox-dunes', name: 'Dunes', palette: 'Gruvbox', file: 'gruvbox-dunes.svg' },
  { id: 'nord-aurora', name: 'Aurora', palette: 'Nord', file: 'nord-aurora.svg' },
  { id: 'nord-peaks', name: 'Arctic Peaks', palette: 'Nord', file: 'nord-peaks.svg' },
  { id: 'everforest-layers', name: 'Forest Layers', palette: 'Everforest', file: 'everforest-layers.svg' },
  { id: 'everforest-mist', name: 'Valley Mist', palette: 'Everforest', file: 'everforest-mist.svg' },
  { id: 'rose-pine-dawn', name: 'Dawn', palette: 'Rosé Pine', file: 'rose-pine-dawn.svg' },
  { id: 'rose-pine-waves', name: 'Muted Waves', palette: 'Rosé Pine', file: 'rose-pine-waves.svg' },
  { id: 'dracula-abstract', name: 'Abstract', palette: 'Dracula', file: 'dracula-abstract.svg' },
  { id: 'minimal-triangle', name: 'Minimal Triangle', palette: 'Minimal', file: 'minimal-triangle.svg' },
  { id: 'low-poly', name: 'Low Poly', palette: 'Minimal', file: 'low-poly.svg' },
  { id: 'topographic', name: 'Topographic', palette: 'Minimal', file: 'topographic.svg' },
  { id: 'concentric-arcs', name: 'Concentric Arcs', palette: 'Minimal', file: 'concentric-arcs.svg' },
  { id: 'isometric-grid', name: 'Isometric Horizon', palette: 'Minimal', file: 'isometric-grid.svg' },
  { id: 'scanlines', name: 'Scanlines', palette: 'Terminal', file: 'scanlines.svg' },
];

export const DEFAULT_WALLPAPER = 'tokyo-night-skyline';

/** Look up a wallpaper by id, falling back to the default. */
export function getWallpaper(id) {
  return WALLPAPERS.find((w) => w.id === id)
    || WALLPAPERS.find((w) => w.id === DEFAULT_WALLPAPER)
    || WALLPAPERS[0];
}

/**
 * Resolve a wallpaper id to a URL. Uses Vite's BASE_URL so the paths keep
 * working when the site is served from a GitHub Pages sub-path.
 */
export function wallpaperUrl(id) {
  const base = import.meta.env?.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}wallpapers/${getWallpaper(id).file}`;
}
