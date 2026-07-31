import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeybindings } from '../wm/useKeybindings';

function press(key, opts = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, metaKey: true, bubbles: true, cancelable: true, ...opts }));
}

describe('useKeybindings', () => {
  it('invokes the launcher handler on Super+D', () => {
    const launcher = vi.fn();
    renderHook(() => useKeybindings({ launcher }));
    press('d');
    expect(launcher).toHaveBeenCalledTimes(1);
  });

  it('passes the workspace number on Super+[1-5]', () => {
    const workspace = vi.fn();
    renderHook(() => useKeybindings({ workspace }));
    press('3');
    expect(workspace).toHaveBeenCalledWith(3);
  });

  it('routes Super+Shift+[1-5] to moveWorkspace', () => {
    const workspace = vi.fn();
    const moveWorkspace = vi.fn();
    renderHook(() => useKeybindings({ workspace, moveWorkspace }));
    press('2', { shiftKey: true });
    expect(moveWorkspace).toHaveBeenCalledWith(2);
    expect(workspace).not.toHaveBeenCalled();
  });

  it('does nothing without the Super/Alt modifier', () => {
    const launcher = vi.fn();
    renderHook(() => useKeybindings({ launcher }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
    expect(launcher).not.toHaveBeenCalled();
  });

  it('respects the enabled:false option', () => {
    const launcher = vi.fn();
    renderHook(() => useKeybindings({ launcher }, { enabled: false }));
    press('d');
    expect(launcher).not.toHaveBeenCalled();
  });
});
