import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { WALLPAPERS, DEFAULT_WALLPAPER, getWallpaper, wallpaperUrl } from '../data/wallpapers';

const DIR = resolve(process.cwd(), 'public/wallpapers');

describe('wallpaper manifest', () => {
  it('ships exactly 20 wallpapers', () => {
    expect(WALLPAPERS).toHaveLength(20);
  });

  it('has unique ids and files', () => {
    expect(new Set(WALLPAPERS.map((w) => w.id)).size).toBe(20);
    expect(new Set(WALLPAPERS.map((w) => w.file)).size).toBe(20);
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
    for (const p of ['Tokyo Night', 'Catppuccin Mocha', 'Gruvbox', 'Nord']) {
      expect(palettes.has(p), `no ${p} wallpaper`).toBe(true);
    }
  });
});
