import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRiceWM } from '../wm/useRiceWM';

const DEFS = {
  terminal: { title: 'raza@arch: ~', color: '#7dcfff', w: 580, h: 400 },
  files: { title: 'Files', color: '#e0af68', w: 620, h: 420 },
  code: { title: 'Code', color: '#7aa2f7', w: 740, h: 500 },
};

describe('workspace round trip', () => {
  it('restores the exact tiling after leaving and returning', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    act(() => result.current.openApp('terminal'));
    act(() => result.current.openApp('files'));
    const before = { ...result.current.geometry };

    act(() => result.current.switchWorkspace(2));
    expect(result.current.openIds).toHaveLength(0);

    act(() => result.current.switchWorkspace(1));
    expect(result.current.openIds).toHaveLength(2);
    expect(result.current.geometry).toEqual(before);
  });

  it('keeps a resized split ratio across a workspace round trip', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    act(() => result.current.openApp('terminal'));
    act(() => result.current.openApp('files'));

    const divider = result.current.dividers[0];
    act(() => result.current.nudgeDivider(divider, 0.1));
    const resized = { ...result.current.geometry };

    act(() => result.current.switchWorkspace(4));
    act(() => result.current.switchWorkspace(1));
    expect(result.current.geometry).toEqual(resized);
  });

  it('focuses a window that actually lives on the workspace switched to', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    act(() => result.current.openApp('terminal'));
    act(() => result.current.switchWorkspace(3));
    expect(result.current.focusedId).toBeNull();
    act(() => result.current.switchWorkspace(1));
    expect(result.current.focusedId).toBe('term1');
  });

  it('tracks which workspaces are occupied', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    act(() => result.current.openApp('terminal'));
    act(() => result.current.switchWorkspace(3));
    act(() => result.current.openApp('files'));
    expect([...result.current.occupied].sort()).toEqual([1, 3]);
  });

  it('moving a window to another workspace leaves the first one empty', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    act(() => result.current.openApp('terminal'));
    act(() => result.current.moveToWorkspace('term1', 5));
    expect(result.current.activeWorkspace).toBe(5);
    expect(result.current.openIds).toEqual(['term1']);
    act(() => result.current.switchWorkspace(1));
    expect(result.current.openIds).toHaveLength(0);
  });
});
