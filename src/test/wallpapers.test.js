import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { WALLPAPERS, DEFAULT_WALLPAPER, getWallpaper, wallpaperUrl } from '../data/wallpapers';

const DIR = resolve(process.cwd(), 'public/wallpapers');

describe('wallpaper manifest', () => {
  it('ships exactly 37 wallpapers', () => {
    expect(WALLPAPERS).toHaveLength(37);
  });

  it('has unique ids and files', () => {
    expect(new Set(WALLPAPERS.map((w) => w.id)).size).toBe(WALLPAPERS.length);
    expect(new Set(WALLPAPERS.map((w) => w.file)).size).toBe(WALLPAPERS.length);
  });

  it('every manifest entry exists on disk', () => {
    const onDisk = new Set(readdirSync(DIR));
    for (const w of WALLPAPERS) {
      expect(onDisk.has(w.file), `missing ${w.file}`).toBe(true);
    }
  });

  it('ships no leftover raster wallpapers', () => {
    const stray = readdirSync(DIR).filter((f) => !f.endsWith('.svg'));
    expect(stray, `unexpected non-SVG wallpapers: ${stray.join(', ')}`).toEqual([]);
  });

  it('the default wallpaper resolves', () => {
    expect(getWallpaper(DEFAULT_WALLPAPER).id).toBe(DEFAULT_WALLPAPER);
  });

  it('falls back to the default for an unknown id', () => {
    expect(getWallpaper('does-not-exist').id).toBe(DEFAULT_WALLPAPER);
  });

  it('builds a base-aware url', () => {
    expect(wallpaperUrl('tokyo-night-grid')).toMatch(/wallpapers\/tokyo-night-grid\.svg$/);
  });

  it('covers several rice palettes', () => {
    const palettes = new Set(WALLPAPERS.map((w) => w.palette));
    for (const p of ['Tokyo Night', 'Catppuccin Mocha', 'Gruvbox', 'Nord', 'Kanagawa', 'Synthwave', 'Anime']) {
      expect(palettes.has(p), `no ${p} wallpaper`).toBe(true);
    }
  });
});

describe('wallpaper URLs under a sub-path deploy', () => {
  it('prefixes every wallpaper with the Vite base URL', () => {
    const base = import.meta.env?.BASE_URL || '/';
    for (const w of WALLPAPERS) {
      expect(wallpaperUrl(w.id)).toBe(`${base}wallpapers/${w.file}`);
    }
  });

  it('never produces a double slash between the base and the folder', () => {
    for (const w of WALLPAPERS) {
      expect(wallpaperUrl(w.id)).not.toMatch(/[^:]\/\//);
    }
  });

  it('resolves an unknown id to the default wallpaper file', () => {
    expect(wallpaperUrl('nope')).toMatch(/tokyo-night-skyline\.svg$/);
  });
});
