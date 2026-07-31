import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHyprland } from '../wm/useHyprland';

const initial = () => ({
  terminal: { id: 'terminal', title: 'kitty', isOpen: true, isMinimized: false, zIndex: 10 },
  files: { id: 'files', title: 'Files', isOpen: false, isMinimized: false, zIndex: 1 },
  firefox: { id: 'firefox', title: 'Firefox', isOpen: false, isMinimized: false, zIndex: 1 },
});

describe('useHyprland', () => {
  it('marks the initially-open window active', () => {
    const { result } = renderHook(() => useHyprland(initial()));
    expect(result.current.activeId).toBe('terminal');
    expect(result.current.activeWorkspace).toBe(1);
  });

  it('openWindow opens on the active workspace and focuses it', () => {
    const { result } = renderHook(() => useHyprland(initial()));
    act(() => result.current.openWindow('firefox'));
    expect(result.current.activeId).toBe('firefox');
    expect(result.current.windows.firefox.isOpen).toBe(true);
    expect(result.current.windows.firefox.workspace).toBe(1);
  });

  it('switchWorkspace moves focus to a window on the target workspace', () => {
    const { result } = renderHook(() => useHyprland(initial()));
    act(() => result.current.openWindow('firefox'));
    act(() => result.current.moveToWorkspace('firefox', 2));
    expect(result.current.activeWorkspace).toBe(2);
    expect(result.current.windows.firefox.workspace).toBe(2);
    act(() => result.current.switchWorkspace(1));
    expect(result.current.activeId).toBe('terminal');
  });

  it('cycleFocus wraps around open windows on the workspace', () => {
    const { result } = renderHook(() => useHyprland(initial()));
    act(() => result.current.openWindow('files'));
    act(() => result.current.openWindow('firefox'));
    // terminal(z10) < files < firefox by zIndex; active is firefox
    act(() => result.current.cycleFocus(1));
    expect(result.current.activeId).toBe('terminal');
    act(() => result.current.cycleFocus(-1));
    expect(result.current.activeId).toBe('firefox');
  });

  it('toggleFloating flips the floating flag', () => {
    const { result } = renderHook(() => useHyprland(initial()));
    const before = result.current.windows.terminal.floating;
    act(() => result.current.toggleFloating('terminal'));
    expect(result.current.windows.terminal.floating).toBe(!before);
  });

  it('closeWindow reassigns focus to the remaining top window', () => {
    const { result } = renderHook(() => useHyprland(initial()));
    act(() => result.current.openWindow('firefox'));
    act(() => result.current.closeWindow('firefox'));
    expect(result.current.windows.firefox.isOpen).toBe(false);
    expect(result.current.activeId).toBe('terminal');
  });
});
