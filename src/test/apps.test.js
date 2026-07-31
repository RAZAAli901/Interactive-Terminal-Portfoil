import { describe, it, expect } from 'vitest';
import { APPS, CATEGORIES, enabledApps, desktopApps, appsByCategory } from '../config/apps';

describe('app registry', () => {
  it('every app has a valid category', () => {
    for (const app of Object.values(APPS)) {
      expect(Object.keys(CATEGORIES)).toContain(app.category);
    }
  });

  it('enabledApps excludes disabled (legacy Windows) apps', () => {
    const enabled = enabledApps().map((a) => a.id);
    expect(enabled).toContain('terminal');
    expect(enabled).toContain('firefox');
    // legacy Office/store are disabled by default
    expect(enabled).not.toContain('word');
    expect(enabled).not.toContain('store');
  });

  it('desktopApps is a subset of enabled apps flagged for the desktop', () => {
    const enabled = new Set(enabledApps().map((a) => a.id));
    for (const app of desktopApps()) {
      expect(enabled.has(app.id)).toBe(true);
      expect(app.desktop).toBe(true);
    }
  });

  it('appsByCategory groups only enabled apps and covers every category key', () => {
    const groups = appsByCategory();
    expect(Object.keys(groups)).toEqual(Object.keys(CATEGORIES));
    const flat = Object.values(groups).flat();
    expect(flat.every((a) => a.enabled)).toBe(true);
    expect(flat).toHaveLength(enabledApps().length);
  });

  it('exec commands are non-empty strings for launcher search', () => {
    for (const app of enabledApps()) {
      expect(typeof app.exec).toBe('string');
      expect(app.exec.length).toBeGreaterThan(0);
    }
  });
});
