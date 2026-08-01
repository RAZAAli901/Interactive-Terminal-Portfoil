import { describe, it, expect } from 'vitest';
import { GAP, computeLayout, tilingArea } from '../layout/bsp';
import { initialState, wmReducer } from '../wm/wmReducer';

// The exact viewport the cascade below was verified against in a real browser.
const AREA = tilingArea(1440, 900, 40, 12);
const DEFS = Object.fromEntries(
  ['terminal', 'files', 'browser', 'code', 'projects'].map((a) => [a, { title: a, color: '#fff', w: 600, h: 400 }]),
);

const openAll = (apps) => apps.reduce(
  (s, app) => wmReducer(s, { type: 'open', app, def: DEFS[app], area: AREA }),
  initialState(),
);

describe('dwindle cascade — browser-verified geometry', () => {
  it('lays five windows into the classic spiral', () => {
    const s = openAll(['terminal', 'files', 'browser', 'code', 'projects']);
    const { rects } = computeLayout(s.trees[1], AREA, GAP);

    // Left half stays with the first window; each new window subdivides the
    // most recently focused pane, walking down the right-hand side.
    expect(rects.term1).toEqual({ x: 12, y: 52, w: 704, h: 836 });
    expect(rects.files).toEqual({ x: 724, y: 52, w: 704, h: 414 });
    expect(rects.browser).toEqual({ x: 724, y: 474, w: 348, h: 414 });
    expect(rects.code).toEqual({ x: 1080, y: 474, w: 348, h: 203 });
    expect(rects.projects).toEqual({ x: 1080, y: 685, w: 348, h: 203 });
  });

  it('never overlaps for any window count up to eight', () => {
    const apps = ['terminal', 'files', 'browser', 'code', 'projects'];
    for (let n = 2; n <= apps.length; n += 1) {
      const s = openAll(apps.slice(0, n));
      const list = Object.values(computeLayout(s.trees[1], AREA, GAP).rects);
      for (let i = 0; i < list.length; i += 1) {
        for (let j = i + 1; j < list.length; j += 1) {
          const a = list[i]; const b = list[j];
          const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
          const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
          expect(ox > 1 && oy > 1, `n=${n}: panes ${i} and ${j} overlap`).toBe(false);
        }
      }
    }
  });

  it('keeps every pane inside the tiling area', () => {
    const s = openAll(['terminal', 'files', 'browser', 'code', 'projects']);
    for (const r of Object.values(computeLayout(s.trees[1], AREA, GAP).rects)) {
      expect(r.x).toBeGreaterThanOrEqual(AREA.x);
      expect(r.y).toBeGreaterThanOrEqual(AREA.y);
      expect(r.x + r.w).toBeLessThanOrEqual(AREA.x + AREA.w);
      expect(r.y + r.h).toBeLessThanOrEqual(AREA.y + AREA.h);
    }
  });

  it('leaves every pane large enough to render its chrome', () => {
    const s = openAll(['terminal', 'files', 'browser', 'code', 'projects']);
    for (const r of Object.values(computeLayout(s.trees[1], AREA, GAP).rects)) {
      // 34px title bar plus a usable body.
      expect(r.h).toBeGreaterThan(80);
      expect(r.w).toBeGreaterThan(120);
    }
  });
});
