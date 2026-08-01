import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRiceWM } from '../wm/useRiceWM';

const DEFS = {
  terminal: { title: 'raza@arch: ~', color: '#7dcfff', w: 580, h: 400 },
  files: { title: 'Files', color: '#e0af68', w: 620, h: 420 },
};

const mouse = (type, x, y, buttons = 1) =>
  act(() => {
    document.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, buttons, bubbles: true }));
  });

const openTwo = (result) => {
  act(() => result.current.openApp('terminal'));
  act(() => result.current.openApp('files'));
};

beforeEach(() => {
  window.innerWidth = 1440;
  window.innerHeight = 900;
});

describe('pointer gestures', () => {
  it('a divider drag re-ratios the split', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    openTwo(result);
    const before = result.current.geometry.term1.w;
    const divider = result.current.dividers[0];

    act(() => result.current.startDivider(divider, { preventDefault() {} }));
    mouse('mousemove', 400, 400);
    mouse('mouseup', 400, 400, 0);

    expect(result.current.geometry.term1.w).not.toBe(before);
    // The gap between the panes is preserved after resizing.
    const a = result.current.geometry.term1;
    const b = result.current.geometry.files;
    expect(b.x - (a.x + a.w)).toBe(8);
  });

  it('a title-bar drag onto the other pane swaps them', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    openTwo(result);
    const before = { ...result.current.geometry };

    act(() => result.current.startTileDrag('term1', { clientX: 100, clientY: 100 }));
    // Move over the Files pane, then release.
    const target = before.files;
    mouse('mousemove', target.x + 20, target.y + 20);
    expect(result.current.drag.target).toBe('files');
    mouse('mouseup', target.x + 20, target.y + 20, 0);

    expect(result.current.geometry.term1).toEqual(before.files);
    expect(result.current.geometry.files).toEqual(before.term1);
    expect(result.current.drag.id).toBeNull();
  });

  it('releasing over empty space does not swap', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    openTwo(result);
    const before = { ...result.current.geometry };

    act(() => result.current.startTileDrag('term1', { clientX: 100, clientY: 100 }));
    mouse('mousemove', 5, 5); // outside every pane
    mouse('mouseup', 5, 5, 0);

    expect(result.current.geometry).toEqual(before);
  });

  it('a mousemove with no button held ends a stuck gesture', () => {
    const { result } = renderHook(() => useRiceWM(DEFS));
    openTwo(result);

    act(() => result.current.startTileDrag('term1', { clientX: 100, clientY: 100 }));
    expect(result.current.drag.id).toBe('term1');

    // The button was released off-document, so no mouseup ever arrived.
    mouse('mousemove', 300, 300, 0);
    expect(result.current.drag.id).toBeNull();
  });
});
