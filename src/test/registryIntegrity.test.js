import { describe, it, expect } from 'vitest';
import { APPS, enabledApps, appsByCategory, CATEGORIES } from '../config/apps';

describe('app registry integrity', () => {
  it('has no duplicate ids', () => {
    const ids = Object.values(APPS).map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keys match their id field', () => {
    for (const [key, app] of Object.entries(APPS)) {
      expect(app.id).toBe(key);
    }
  });

  it('every enabled app has positive default geometry', () => {
    for (const app of enabledApps()) {
      expect(app.width).toBeGreaterThan(0);
      expect(app.height).toBeGreaterThan(0);
    }
  });

  it('groups apps in CATEGORIES order', () => {
    const groups = appsByCategory();
    expect(Object.keys(groups)).toEqual(Object.keys(CATEGORIES));
  });

  it('keeps all legacy apps disabled', () => {
    for (const app of Object.values(APPS)) {
      if (app.category === 'legacy') expect(app.enabled).toBe(false);
    }
  });
});
