import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRiceWM } from '../wm/useRiceWM';

const DEFS = {
  terminal: { title: 'raza@arch: ~', color: '#7dcfff', w: 580, h: 400 },
  files: { title: 'Files', color: '#e0af68', w: 620, h: 420 },
};

describe('mountedIds — window state preservation', () => {
  it('keeps off-workspace windows mounted', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    act(() => result.current.openApp('terminal'));
    act(() => result.current.switchWorkspace(2));
    act(() => result.current.openApp('files'));

    // Only `files` is on the active workspace…
    expect(result.current.openIds).toEqual(['files']);
    // …but both stay mounted so neither app is torn down.
    expect(result.current.mountedIds).toEqual(['files', 'term1']);
  });

  it('drops minimized windows from the mounted set', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    act(() => result.current.openApp('terminal'));
    act(() => result.current.openApp('files'));
    expect(result.current.mountedIds).toHaveLength(2);

    act(() => result.current.minimizeWindow('files'));
    expect(result.current.mountedIds).toEqual(['term1']);
  });

  it('drops closed windows from the mounted set', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    act(() => result.current.openApp('terminal'));
    act(() => result.current.closeWindow('term1'));
    expect(result.current.mountedIds).toEqual([]);
  });

  it('keeps a stable order so React never remounts on reorder', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    act(() => result.current.openApp('terminal'));
    act(() => result.current.openApp('files'));
    const first = result.current.mountedIds;

    // Focusing bumps z-order, which must not reshuffle the mount list.
    act(() => result.current.focusWindow('term1'));
    expect(result.current.mountedIds).toEqual(first);
  });

  it('remounts nothing when switching workspaces back and forth', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    act(() => result.current.openApp('terminal'));
    act(() => result.current.openApp('files'));
    const before = result.current.mountedIds;

    act(() => result.current.switchWorkspace(4));
    expect(result.current.mountedIds).toEqual(before);
    act(() => result.current.switchWorkspace(1));
    expect(result.current.mountedIds).toEqual(before);
  });
});
