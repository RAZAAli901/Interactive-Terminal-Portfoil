import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRiceWM, WAYBAR_H } from '../wm/useRiceWM';
import { RICE_APPS } from '../config/riceApps';
import { MARGIN, tilingArea } from '../layout/bsp';

// The hook reads window.innerWidth/innerHeight on mount, so pin the viewport to
// make the tiling area — and therefore every rect — deterministic.
const VIEW_W = 1280;
const VIEW_H = 800;

function setViewport(w, h) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: w });
  Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: h });
}

/** Mount the hook against the real app table. */
const mount = () => renderHook(() => useRiceWM(RICE_APPS));

/** Open apps in order; ids are the RICE_APPS keys. */
const open = (result, ...apps) => act(() => {
  apps.forEach((app) => result.current.openApp(app));
});

/** True when two rects share more than a zero-area sliver. */
function overlaps(a, b) {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return ox > 0 && oy > 0;
}

/** Every unordered pair of the geometry rects. */
function pairs(geometry) {
  const list = Object.values(geometry);
  const out = [];
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) out.push([list[i], list[j]]);
  }
  return out;
}

beforeEach(() => setViewport(VIEW_W, VIEW_H));

describe('useRiceWM — opening apps', () => {
  it('starts empty, tiling, on workspace 1', () => {
    const { result } = mount();
    expect(result.current.openIds).toEqual([]);
    expect(result.current.geometry).toEqual({});
    expect(result.current.tiling).toBe(true);
    expect(result.current.activeWorkspace).toBe(1);
    expect(result.current.focusedId).toBeNull();
  });

  it('derives the tiling area from the pinned viewport', () => {
    const { result } = mount();
    expect(result.current.area).toEqual(tilingArea(VIEW_W, VIEW_H, WAYBAR_H, MARGIN));
    expect(result.current.area).toEqual({ x: 12, y: 52, w: 1256, h: 736 });
  });

  it('opens an app, focuses it and gives it the whole tiling area', () => {
    const { result } = mount();
    open(result, 'files');
    expect(result.current.openIds).toEqual(['files']);
    expect(result.current.focusedId).toBe('files');
    expect(result.current.geometry.files).toEqual(result.current.area);
  });

  it('tracks every opened window in openIds and geometry', () => {
    const { result } = mount();
    open(result, 'terminal', 'files', 'code');
    expect(result.current.openIds).toEqual(['term1', 'files', 'code']);
    expect(Object.keys(result.current.geometry).sort()).toEqual(['code', 'files', 'term1']);
    expect(result.current.dividers).toHaveLength(2);
  });

  it('raises an already-open singleton app instead of opening a second copy', () => {
    const { result } = mount();
    open(result, 'files');
    open(result, 'terminal');
    open(result, 'files');
    expect(result.current.openIds.filter((id) => id === 'files')).toHaveLength(1);
    expect(result.current.openIds).toHaveLength(2);
    expect(result.current.focusedId).toBe('files');
  });

  it('spawns a second window when terminal is opened twice', () => {
    const { result } = mount();
    open(result, 'terminal');
    open(result, 'terminal');
    expect(result.current.openIds).toEqual(['term1', 'term2']);
    expect(Object.keys(result.current.geometry).sort()).toEqual(['term1', 'term2']);
  });
});

describe('useRiceWM — tiled geometry never overlaps', () => {
  it.each([
    [2, ['terminal', 'files']],
    [3, ['terminal', 'files', 'code']],
    [4, ['terminal', 'files', 'code', 'browser']],
  ])('lays out %i windows without overlap', (count, apps) => {
    const { result } = mount();
    open(result, ...apps);

    const { geometry, area } = result.current;
    expect(Object.keys(geometry)).toHaveLength(count);

    pairs(geometry).forEach(([a, b]) => {
      expect(overlaps(a, b)).toBe(false);
    });

    // and every pane stays inside the tiling area
    Object.values(geometry).forEach((r) => {
      expect(r.x).toBeGreaterThanOrEqual(area.x);
      expect(r.y).toBeGreaterThanOrEqual(area.y);
      expect(r.x + r.w).toBeLessThanOrEqual(area.x + area.w);
      expect(r.y + r.h).toBeLessThanOrEqual(area.y + area.h);
    });
  });
});

describe('useRiceWM — minimize and close', () => {
  it('minimize drops the window from openIds but keeps it in the dock', () => {
    const { result } = mount();
    open(result, 'terminal', 'files');

    act(() => result.current.minimizeWindow('files'));

    expect(result.current.openIds).toEqual(['term1']);
    expect(result.current.geometry.files).toBeUndefined();

    const dock = result.current.dockWindows;
    expect(dock.map((w) => w.id).sort()).toEqual(['files', 'term1']);
    expect(dock.find((w) => w.id === 'files')).toMatchObject({
      minimized: true,
      title: RICE_APPS.files.title,
      color: RICE_APPS.files.color,
    });
    expect(dock.find((w) => w.id === 'term1').minimized).toBe(false);
  });

  it('focusing a minimized window brings it back into the layout', () => {
    const { result } = mount();
    open(result, 'terminal', 'files');
    act(() => result.current.minimizeWindow('files'));
    act(() => result.current.focusWindow('files'));

    expect(result.current.openIds).toContain('files');
    expect(result.current.dockWindows.find((w) => w.id === 'files').minimized).toBe(false);
    expect(result.current.focusedId).toBe('files');
  });

  it('close removes the window from openIds, geometry and the dock', () => {
    const { result } = mount();
    open(result, 'terminal', 'files');

    act(() => result.current.closeWindow('files'));

    expect(result.current.openIds).toEqual(['term1']);
    expect(result.current.geometry.files).toBeUndefined();
    expect(result.current.dockWindows.map((w) => w.id)).toEqual(['term1']);
    // the survivor reclaims the full area
    expect(result.current.geometry.term1).toEqual(result.current.area);
  });
});

describe('useRiceWM — workspaces', () => {
  it('isolates windows per workspace', () => {
    const { result } = mount();
    open(result, 'terminal');
    act(() => result.current.switchWorkspace(2));
    expect(result.current.openIds).toEqual([]);

    open(result, 'files');
    expect(result.current.openIds).toEqual(['files']);
    expect(result.current.dockWindows.map((w) => w.id)).toEqual(['files']);

    act(() => result.current.switchWorkspace(1));
    expect(result.current.activeWorkspace).toBe(1);
    expect(result.current.openIds).toEqual(['term1']);
    expect(result.current.geometry.files).toBeUndefined();
  });

  it('reports which workspaces hold windows via `occupied`', () => {
    const { result } = mount();
    expect([...result.current.occupied]).toEqual([]);

    open(result, 'terminal');
    act(() => result.current.switchWorkspace(3));
    open(result, 'files');

    expect([...result.current.occupied].sort()).toEqual([1, 3]);

    act(() => result.current.switchWorkspace(1));
    act(() => result.current.closeWindow('term1'));
    expect([...result.current.occupied].sort()).toEqual([3]);
  });

  it('drops a workspace from `occupied` once its only window is minimized', () => {
    const { result } = mount();
    open(result, 'terminal');
    act(() => result.current.minimizeWindow('term1'));
    expect([...result.current.occupied]).toEqual([]);
    expect(result.current.dockWindows).toHaveLength(1);
  });
});

describe('useRiceWM — layout mode', () => {
  it('toggleLayout flips between dwindle and float', () => {
    const { result } = mount();
    open(result, 'terminal');

    expect(result.current.layout).toBe('dwindle');
    act(() => result.current.toggleLayout());
    expect(result.current.layout).toBe('float');
    expect(result.current.tiling).toBe(false);

    act(() => result.current.toggleLayout());
    expect(result.current.layout).toBe('dwindle');
    expect(result.current.tiling).toBe(true);
  });

  it('float geometry comes from the window fx/fy/fw/fh, not the tree', () => {
    const { result } = mount();
    open(result, 'terminal');
    act(() => result.current.toggleLayout());
    // opened while floating, so this window never enters the BSP tree
    open(result, 'files');

    const win = result.current.windows.files;
    expect(result.current.rects.files).toBeUndefined();
    expect(result.current.geometry.files).toEqual({ x: win.fx, y: win.fy, w: win.fw, h: win.fh });
    expect(win.fw).toBe(RICE_APPS.files.w);
    expect(win.fh).toBe(RICE_APPS.files.h);
  });

  it('detaching from dwindle leaves each window sitting on its old tiled rect', () => {
    const { result } = mount();
    open(result, 'terminal', 'files');
    const tiled = { ...result.current.geometry.term1 };

    act(() => result.current.toggleLayout());

    expect(result.current.geometry.term1).toEqual(tiled);
    const win = result.current.windows.term1;
    expect({ x: win.fx, y: win.fy, w: win.fw, h: win.fh }).toEqual(tiled);
  });

  it('re-tiles every floating window when dwindle comes back', () => {
    const { result } = mount();
    open(result, 'terminal');
    act(() => result.current.toggleLayout());
    open(result, 'files', 'code');

    act(() => result.current.toggleLayout());

    expect(Object.keys(result.current.rects).sort()).toEqual(['code', 'files', 'term1']);
    pairs(result.current.geometry).forEach(([a, b]) => {
      expect(overlaps(a, b)).toBe(false);
    });
  });
});

describe('useRiceWM — cycleFocus', () => {
  it('does nothing with fewer than two windows', () => {
    const { result } = mount();
    open(result, 'files');
    act(() => result.current.cycleFocus(1));
    expect(result.current.focusedId).toBe('files');
  });

  it('moves focus backwards through the open windows', () => {
    const { result } = mount();
    open(result, 'terminal', 'files', 'code');
    expect(result.current.openIds).toEqual(['term1', 'files', 'code']);
    expect(result.current.focusedId).toBe('code');

    act(() => result.current.cycleFocus(-1));
    expect(result.current.focusedId).toBe('files');
  });

  it('wraps from the last window round to the first', () => {
    const { result } = mount();
    open(result, 'terminal', 'files', 'code');

    const ids = result.current.openIds;
    expect(result.current.focusedId).toBe(ids[ids.length - 1]);

    act(() => result.current.cycleFocus(1));
    expect(result.current.focusedId).toBe(ids[0]);
  });

  it('marks the focused window in the dock list', () => {
    const { result } = mount();
    open(result, 'terminal', 'files');
    const focused = result.current.dockWindows.filter((w) => w.focused);
    expect(focused).toHaveLength(1);
    expect(focused[0].id).toBe(result.current.focusedId);
  });
});
