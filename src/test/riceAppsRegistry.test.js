import { describe, it, expect } from 'vitest';
import { RICE_APPS, LAUNCHABLE, appTitle, appColor } from '../config/riceApps';

describe('rice app registry', () => {
  it('defines the seven design-handoff apps', () => {
    for (const id of ['terminal', 'files', 'browser', 'code', 'about', 'projects', 'power']) {
      expect(RICE_APPS[id], `missing ${id}`).toBeDefined();
    }
  });

  it('marks exactly the six launcher-column apps as primary', () => {
    const primary = Object.entries(RICE_APPS).filter(([, d]) => d.primary).map(([id]) => id);
    expect(primary.sort()).toEqual(['about', 'browser', 'code', 'files', 'projects', 'terminal']);
  });

  it('gives every app a title, colour and positive default size', () => {
    for (const [id, def] of Object.entries(RICE_APPS)) {
      expect(def.title, id).toBeTruthy();
      expect(def.color, id).toMatch(/^#[0-9a-f]{6}$/i);
      expect(def.w, id).toBeGreaterThan(0);
      expect(def.h, id).toBeGreaterThan(0);
    }
  });

  it('keeps the power window out of the search launcher', () => {
    expect(LAUNCHABLE.some((a) => a.id === 'power')).toBe(false);
    expect(LAUNCHABLE.length).toBe(Object.keys(RICE_APPS).length - 1);
  });

  it('gives every launchable app a unique exec name to search on', () => {
    const execs = LAUNCHABLE.map((a) => a.exec);
    expect(new Set(execs).size).toBe(execs.length);
  });

  it('resolves titles and colours, falling back for unknown ids', () => {
    expect(appTitle('terminal')).toBe('raza@arch: ~');
    expect(appColor('files')).toBe('#e0af68');
    expect(appTitle('nope')).toBe('nope');
    expect(appColor('nope')).toMatch(/^#/);
  });

  it('uses the design handoff geometry for the primary apps', () => {
    expect(RICE_APPS.terminal).toMatchObject({ w: 580, h: 400 });
    expect(RICE_APPS.about).toMatchObject({ w: 540, h: 470 });
    expect(RICE_APPS.code).toMatchObject({ w: 740, h: 500 });
    expect(RICE_APPS.browser).toMatchObject({ w: 760, h: 540 });
  });
});
