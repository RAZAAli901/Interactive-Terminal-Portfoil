import { describe, it, expect, beforeEach } from 'vitest';
import {
  WORKSPACE_COUNT, normalizeMap, loadWorkspaceWallpapers, saveWorkspaceWallpapers,
} from '../data/workspaceWallpapers';
import { WALLPAPERS, DEFAULT_WALLPAPER } from '../data/wallpapers';

const ids = new Set(WALLPAPERS.map((w) => w.id));

describe('normalizeMap', () => {
  it('fills every workspace with a resolvable wallpaper', () => {
    const map = normalizeMap(null);
    expect(Object.keys(map)).toHaveLength(WORKSPACE_COUNT);
    for (let ws = 1; ws <= WORKSPACE_COUNT; ws += 1) {
      expect(ids.has(map[ws]), `ws ${ws}`).toBe(true);
    }
  });

  it('seeds distinct wallpapers by default', () => {
    const map = normalizeMap(null);
    expect(new Set(Object.values(map)).size).toBe(WORKSPACE_COUNT);
  });

  it('keeps valid stored ids and repairs invalid ones', () => {
    const map = normalizeMap({ 1: 'gruvbox-sun', 2: 'not-real' });
    expect(map[1]).toBe('gruvbox-sun');
    expect(ids.has(map[2])).toBe(true);
  });
});

describe('load / save round trip', () => {
  beforeEach(() => localStorage.clear());

  it('persists and reloads a chosen map', () => {
    const map = normalizeMap(null);
    map[3] = 'dracula-abstract';
    saveWorkspaceWallpapers(map);
    expect(loadWorkspaceWallpapers()[3]).toBe('dracula-abstract');
  });

  it('migrates a legacy single-wallpaper preference to every workspace', () => {
    localStorage.setItem('hypr_wallpaper', 'nord-aurora');
    const loaded = loadWorkspaceWallpapers();
    for (let ws = 1; ws <= WORKSPACE_COUNT; ws += 1) {
      expect(loaded[ws]).toBe('nord-aurora');
    }
  });

  it('falls back to seeded defaults with nothing stored', () => {
    expect(loadWorkspaceWallpapers()[1]).toBeDefined();
    expect(ids.has(loadWorkspaceWallpapers()[1])).toBe(true);
  });

  it('recovers from corrupt stored JSON', () => {
    localStorage.setItem('hypr_workspaceWallpapers', '{not json');
    const loaded = loadWorkspaceWallpapers();
    expect(ids.has(loaded[1])).toBe(true);
    expect(loaded[1] || DEFAULT_WALLPAPER).toBeTruthy();
  });
});
