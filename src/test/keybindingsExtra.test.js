import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeybindings } from '../wm/useKeybindings';

const press = (key, opts = {}) =>
  window.dispatchEvent(new KeyboardEvent('keydown', { key, metaKey: true, ...opts }));

describe('useKeybindings — window & workspace motions', () => {
  it('cycles focus with J and K', () => {
    const focusNext = vi.fn();
    const focusPrev = vi.fn();
    renderHook(() => useKeybindings({ focusNext, focusPrev }));
    press('j');
    press('k');
    expect(focusNext).toHaveBeenCalledTimes(1);
    expect(focusPrev).toHaveBeenCalledTimes(1);
  });

  it('moves between workspaces with H and L', () => {
    const workspacePrev = vi.fn();
    const workspaceNext = vi.fn();
    renderHook(() => useKeybindings({ workspacePrev, workspaceNext }));
    press('h');
    press('l');
    expect(workspacePrev).toHaveBeenCalledTimes(1);
    expect(workspaceNext).toHaveBeenCalledTimes(1);
  });

  it('triggers fullscreen (F) and screenshot (P)', () => {
    const fullscreen = vi.fn();
    const screenshot = vi.fn();
    renderHook(() => useKeybindings({ fullscreen, screenshot }));
    press('f');
    press('p');
    expect(fullscreen).toHaveBeenCalledTimes(1);
    expect(screenshot).toHaveBeenCalledTimes(1);
  });

  it('opens the power menu on Escape and cheatsheet on slash', () => {
    const powerMenu = vi.fn();
    const cheatsheet = vi.fn();
    renderHook(() => useKeybindings({ powerMenu, cheatsheet }));
    press('Escape');
    press('/');
    expect(powerMenu).toHaveBeenCalledTimes(1);
    expect(cheatsheet).toHaveBeenCalledTimes(1);
  });
});

describe('useKeybindings — minimize', () => {
  it('minimizes the focused window with Super+M', () => {
    const minimize = vi.fn();
    renderHook(() => useKeybindings({ minimize }));
    press('m');
    expect(minimize).toHaveBeenCalledTimes(1);
  });
});
