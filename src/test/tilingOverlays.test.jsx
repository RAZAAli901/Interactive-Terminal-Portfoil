import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dividers, SwapTarget, DragGhost } from '../wm/TilingOverlays';
import { computeLayout, insertLeaf, leaf } from '../layout/bsp';

const AREA = { x: 12, y: 52, w: 1256, h: 736 };

// dir 'row' => a vertical divider between side-by-side panes.
const ROW_DIVIDER = { sid: 1, dir: 'row', x: 636, y: 52, size: 8, len: 736, prect: AREA };
// dir 'col' => a horizontal divider between stacked panes.
const COL_DIVIDER = { sid: 2, dir: 'col', x: 640, y: 424, size: 8, len: 616, prect: AREA };

/** A real three-window dwindle tree, so the divider records are the real thing. */
function realDividers() {
  let tree = leaf('term1');
  let sid = 1;
  ({ tree, nextSid: sid } = insertLeaf(tree, 'term1', 'files', AREA, sid));
  ({ tree } = insertLeaf(tree, 'files', 'code', AREA, sid));
  return computeLayout(tree, AREA).dividers;
}

describe('<Dividers>', () => {
  it('renders nothing without divider records', () => {
    const { container } = render(<Dividers dividers={[]} />);
    expect(container).toBeEmptyDOMElement();
    const { container: c2 } = render(<Dividers />);
    expect(c2).toBeEmptyDOMElement();
  });

  it('renders one separator per divider record', () => {
    const dividers = realDividers();
    expect(dividers).toHaveLength(2);
    render(<Dividers dividers={dividers} />);
    expect(screen.getAllByRole('separator')).toHaveLength(2);
  });

  it('labels a row split as a vertical separator', () => {
    render(<Dividers dividers={[ROW_DIVIDER]} />);
    const handle = screen.getByRole('separator', { name: 'Resize panes horizontally' });
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('labels a col split as a horizontal separator', () => {
    render(<Dividers dividers={[COL_DIVIDER]} />);
    const handle = screen.getByRole('separator', { name: 'Resize panes vertically' });
    expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('gives every divider the right orientation in a real layout', () => {
    const dividers = realDividers();
    render(<Dividers dividers={dividers} />);
    const handles = screen.getAllByRole('separator');
    dividers.forEach((d, i) => {
      expect(handles[i]).toHaveAttribute(
        'aria-orientation',
        d.dir === 'row' ? 'vertical' : 'horizontal',
      );
    });
  });

  it('centres a 12px grab strip on the 8px gap of a row split', () => {
    render(<Dividers dividers={[ROW_DIVIDER]} />);
    const handle = screen.getByRole('separator');
    // left = x + (size - GRAB) / 2 = 636 + (8 - 12) / 2
    expect(handle.style.left).toBe('634px');
    expect(handle.style.top).toBe('52px');
    expect(handle.style.width).toBe('12px');
    expect(handle.style.height).toBe('736px');
  });

  it('centres a 12px grab strip on the 8px gap of a col split', () => {
    render(<Dividers dividers={[COL_DIVIDER]} />);
    const handle = screen.getByRole('separator');
    expect(handle.style.left).toBe('640px');
    // top = y + (size - GRAB) / 2 = 424 + (8 - 12) / 2
    expect(handle.style.top).toBe('422px');
    expect(handle.style.width).toBe('616px');
    expect(handle.style.height).toBe('12px');
  });

  it('calls onDragStart with the divider record on mousedown', () => {
    const onDragStart = vi.fn();
    render(<Dividers dividers={[ROW_DIVIDER, COL_DIVIDER]} onDragStart={onDragStart} />);

    fireEvent.mouseDown(screen.getByRole('separator', { name: 'Resize panes vertically' }));

    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragStart.mock.calls[0][0]).toBe(COL_DIVIDER);
    expect(onDragStart.mock.calls[0][1].type).toBe('mousedown');
  });

  it('survives a mousedown with no handler attached', () => {
    render(<Dividers dividers={[ROW_DIVIDER]} />);
    expect(() => fireEvent.mouseDown(screen.getByRole('separator'))).not.toThrow();
  });
});

describe('<SwapTarget>', () => {
  it('renders nothing without a rect', () => {
    const { container } = render(<SwapTarget />);
    expect(container).toBeEmptyDOMElement();
    const { container: c2 } = render(<SwapTarget rect={null} />);
    expect(c2).toBeEmptyDOMElement();
  });

  it('sits exactly over the pane it would swap into', () => {
    // Presentational highlight with no role or label, so query the DOM directly.
    const { container } = render(<SwapTarget rect={{ x: 640, y: 52, w: 616, h: 360 }} />);
    const highlight = container.firstChild;
    expect(highlight.style.left).toBe('640px');
    expect(highlight.style.top).toBe('52px');
    expect(highlight.style.width).toBe('616px');
    expect(highlight.style.height).toBe('360px');
  });

  it('tracks a rect that changes mid-drag', () => {
    const { container, rerender } = render(<SwapTarget rect={{ x: 0, y: 0, w: 10, h: 10 }} />);
    rerender(<SwapTarget rect={{ x: 100, y: 200, w: 300, h: 400 }} />);
    expect(container.firstChild.style.left).toBe('100px');
    expect(container.firstChild.style.height).toBe('400px');
  });
});

describe('<DragGhost>', () => {
  it('renders nothing without a cursor', () => {
    const { container } = render(<DragGhost title="Files" color="#e0af68" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the dragged window title', () => {
    render(<DragGhost cursor={{ x: 100, y: 200 }} title="Firefox" color="#f7768e" />);
    expect(screen.getByText('Firefox')).toBeInTheDocument();
  });

  it('trails the cursor by the documented +14px offset', () => {
    const { container } = render(
      <DragGhost cursor={{ x: 100, y: 200 }} title="Files" color="#e0af68" />,
    );
    const ghost = container.firstChild;
    expect(ghost.style.left).toBe('114px');
    expect(ghost.style.top).toBe('214px');
  });

  it('follows the cursor as it moves', () => {
    const { container, rerender } = render(
      <DragGhost cursor={{ x: 100, y: 200 }} title="Files" color="#e0af68" />,
    );
    rerender(<DragGhost cursor={{ x: 480, y: 90 }} title="Files" color="#e0af68" />);
    expect(container.firstChild.style.left).toBe('494px');
    expect(container.firstChild.style.top).toBe('104px');
  });

  it('carries the app colour as --ghost-color and hides the dot from AT', () => {
    const { container } = render(
      <DragGhost cursor={{ x: 0, y: 0 }} title="Files" color="#e0af68" />,
    );
    const ghost = container.firstChild;
    expect(ghost.style.getPropertyValue('--ghost-color')).toBe('#e0af68');
    expect(ghost.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
