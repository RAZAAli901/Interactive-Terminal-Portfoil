import { describe, it, expect } from 'vitest';
import { initialState, wmReducer } from '../wm/wmReducer';
import { allLeaves, computeLayout, hasLeaf } from '../layout/bsp';

const AREA = { x: 12, y: 52, w: 1256, h: 736 };
const DEFS = {
  terminal: { title: 'raza@arch: ~', color: '#7dcfff', w: 580, h: 400 },
  files: { title: 'Files', color: '#e0af68', w: 620, h: 420 },
  code: { title: 'Code', color: '#7aa2f7', w: 740, h: 500 },
};

const open = (state, app) => wmReducer(state, { type: 'open', app, def: DEFS[app], area: AREA });
const openAll = (apps) => apps.reduce((s, a) => open(s, a), initialState());

describe('wmReducer — opening windows', () => {
  it('opens a window, tiles it and focuses it', () => {
    const s = open(initialState(), 'files');
    expect(Object.keys(s.windows)).toEqual(['files']);
    expect(s.focusedId).toBe('files');
    expect(hasLeaf(s.trees[1], 'files')).toBe(true);
  });

  it('gives terminals unique ids so they are multi-instance', () => {
    const s = openAll(['terminal', 'terminal', 'terminal']);
    expect(Object.keys(s.windows).sort()).toEqual(['term1', 'term2', 'term3']);
  });

  it('raises an existing singleton app instead of duplicating it', () => {
    let s = open(initialState(), 'files');
    const z1 = s.windows.files.z;
    s = open(s, 'files');
    expect(Object.keys(s.windows)).toEqual(['files']);
    expect(s.windows.files.z).toBeGreaterThan(z1);
  });

  it('tiles every open window into the active workspace tree', () => {
    const s = openAll(['terminal', 'files', 'code']);
    expect(allLeaves(s.trees[1]).sort()).toEqual(['code', 'files', 'term1']);
  });

  it('lays out three windows without overlap', () => {
    const s = openAll(['terminal', 'files', 'code']);
    const { rects } = computeLayout(s.trees[1], AREA);
    const list = Object.values(rects);
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        const a = list[i]; const b = list[j];
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        expect(ox > 1 && oy > 1).toBe(false);
      }
    }
  });
});

describe('wmReducer — closing and minimizing', () => {
  it('close removes the window and its leaf', () => {
    let s = openAll(['terminal', 'files']);
    s = wmReducer(s, { type: 'close', id: 'files' });
    expect(s.windows.files).toBeUndefined();
    expect(hasLeaf(s.trees[1], 'files')).toBe(false);
    expect(allLeaves(s.trees[1])).toEqual(['term1']);
  });

  it('minimize keeps the window but drops it from the tree', () => {
    let s = openAll(['terminal', 'files']);
    s = wmReducer(s, { type: 'minimize', id: 'files' });
    expect(s.windows.files.min).toBe(true);
    expect(hasLeaf(s.trees[1], 'files')).toBe(false);
  });

  it('focusing a minimized window restores and re-tiles it', () => {
    let s = openAll(['terminal', 'files']);
    s = wmReducer(s, { type: 'minimize', id: 'files' });
    s = wmReducer(s, { type: 'focus', id: 'files', area: AREA });
    expect(s.windows.files.min).toBe(false);
    expect(hasLeaf(s.trees[1], 'files')).toBe(true);
    expect(s.focusedId).toBe('files');
  });

  it('reassigns focus when the focused window closes', () => {
    let s = openAll(['terminal', 'files']);
    s = wmReducer(s, { type: 'close', id: s.focusedId });
    expect(s.focusedId).toBe('term1');
  });
});

describe('wmReducer — workspaces', () => {
  it('keeps a separate tree per workspace', () => {
    let s = open(initialState(), 'terminal');
    s = wmReducer(s, { type: 'workspace', n: 2 });
    s = open(s, 'files');
    expect(allLeaves(s.trees[1])).toEqual(['term1']);
    expect(allLeaves(s.trees[2])).toEqual(['files']);
  });

  it('moveToWorkspace relocates the leaf and follows the window', () => {
    let s = openAll(['terminal', 'files']);
    s = wmReducer(s, { type: 'moveToWorkspace', id: 'files', n: 3, area: AREA });
    expect(s.windows.files.ws).toBe(3);
    expect(hasLeaf(s.trees[1], 'files')).toBe(false);
    expect(hasLeaf(s.trees[3], 'files')).toBe(true);
    expect(s.activeWorkspace).toBe(3);
  });

  it('switching workspaces focuses a window that lives there', () => {
    let s = open(initialState(), 'terminal');
    s = wmReducer(s, { type: 'workspace', n: 2 });
    s = open(s, 'files');
    s = wmReducer(s, { type: 'workspace', n: 1 });
    expect(s.focusedId).toBe('term1');
  });
});

describe('wmReducer — layout mode', () => {
  it('dwindle -> float seeds float rects from the live tiled rects', () => {
    const s = openAll(['terminal', 'files']);
    const { rects } = computeLayout(s.trees[1], AREA);
    const f = wmReducer(s, { type: 'toggleLayout', rects, area: AREA });
    expect(f.layout).toBe('float');
    expect(f.windows.term1.fx).toBe(rects.term1.x);
    expect(f.windows.term1.fw).toBe(rects.term1.w);
  });

  it('float -> dwindle rebuilds a tree containing every open window', () => {
    let s = openAll(['terminal', 'files', 'code']);
    const { rects } = computeLayout(s.trees[1], AREA);
    s = wmReducer(s, { type: 'toggleLayout', rects, area: AREA });
    s = wmReducer(s, { type: 'toggleLayout', rects: {}, area: AREA });
    expect(s.layout).toBe('dwindle');
    expect(allLeaves(s.trees[1]).sort()).toEqual(['code', 'files', 'term1']);
  });

  it('does not tile new windows while floating', () => {
    let s = openAll(['terminal']);
    s = wmReducer(s, { type: 'toggleLayout', rects: {}, area: AREA });
    s = open(s, 'files');
    expect(hasLeaf(s.trees[1], 'files')).toBe(false);
    expect(s.windows.files).toBeDefined();
  });
});

describe('wmReducer — gestures', () => {
  it('moveFloat and resizeFloat update only the float geometry', () => {
    let s = open(initialState(), 'files');
    s = wmReducer(s, { type: 'moveFloat', id: 'files', x: 300, y: 200 });
    s = wmReducer(s, { type: 'resizeFloat', id: 'files', w: 900, h: 600 });
    expect(s.windows.files).toMatchObject({ fx: 300, fy: 200, fw: 900, fh: 600 });
  });

  it('setRatio clamps to the allowed range', () => {
    const s = openAll(['terminal', 'files']);
    const sid = s.trees[1].sid;
    expect(wmReducer(s, { type: 'setRatio', sid, ratio: 5 }).trees[1].ratio).toBeCloseTo(0.88);
    expect(wmReducer(s, { type: 'setRatio', sid, ratio: -5 }).trees[1].ratio).toBeCloseTo(0.12);
  });

  it('swap exchanges two windows and leaves the geometry untouched', () => {
    const s = openAll(['terminal', 'files']);
    const before = computeLayout(s.trees[1], AREA).rects;
    const after = computeLayout(
      wmReducer(s, { type: 'swap', a: 'term1', b: 'files' }).trees[1],
      AREA,
    ).rects;
    expect(after.term1).toEqual(before.files);
    expect(after.files).toEqual(before.term1);
  });

  it('swap is a no-op for a missing or identical target', () => {
    const s = openAll(['terminal', 'files']);
    expect(wmReducer(s, { type: 'swap', a: 'term1', b: 'term1' })).toBe(s);
    expect(wmReducer(s, { type: 'swap', a: 'term1', b: null })).toBe(s);
  });
});
