import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Dividers } from '../wm/TilingOverlays';

const VERTICAL = { sid: 1, dir: 'row', x: 500, y: 52, size: 8, len: 700, prect: { x: 12, y: 52, w: 1000, h: 700 } };
const HORIZONTAL = { sid: 2, dir: 'col', x: 12, y: 400, size: 8, len: 1000, prect: { x: 12, y: 52, w: 1000, h: 700 } };

describe('divider keyboard resize', () => {
  it('exposes each divider as a focusable separator', () => {
    render(<Dividers dividers={[VERTICAL]} />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('aria-orientation', 'vertical');
    expect(sep).toHaveAttribute('tabindex', '0');
  });

  it('grows the first pane with ArrowRight on a vertical split', () => {
    const onNudge = vi.fn();
    render(<Dividers dividers={[VERTICAL]} onNudge={onNudge} />);
    fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowRight' });
    expect(onNudge).toHaveBeenCalledWith(VERTICAL, expect.any(Number));
    expect(onNudge.mock.calls[0][1]).toBeGreaterThan(0);
  });

  it('shrinks the first pane with ArrowLeft', () => {
    const onNudge = vi.fn();
    render(<Dividers dividers={[VERTICAL]} onNudge={onNudge} />);
    fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowLeft' });
    expect(onNudge.mock.calls[0][1]).toBeLessThan(0);
  });

  it('uses up/down for a horizontal split', () => {
    const onNudge = vi.fn();
    render(<Dividers dividers={[HORIZONTAL]} onNudge={onNudge} />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('aria-orientation', 'horizontal');
    fireEvent.keyDown(sep, { key: 'ArrowDown' });
    expect(onNudge.mock.calls[0][1]).toBeGreaterThan(0);
  });

  it('ignores the cross-axis arrows', () => {
    const onNudge = vi.fn();
    render(<Dividers dividers={[VERTICAL]} onNudge={onNudge} />);
    fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowUp' });
    expect(onNudge).not.toHaveBeenCalled();
  });

  it('still starts a pointer drag on mousedown', () => {
    const onDragStart = vi.fn();
    render(<Dividers dividers={[VERTICAL]} onDragStart={onDragStart} />);
    fireEvent.mouseDown(screen.getByRole('separator'));
    expect(onDragStart).toHaveBeenCalled();
  });
});
