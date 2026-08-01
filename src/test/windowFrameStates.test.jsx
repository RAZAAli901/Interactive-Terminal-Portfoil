import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WindowFrame from '../wm/WindowFrame';

const RECT = { x: 10, y: 50, w: 400, h: 300 };

describe('<WindowFrame> states', () => {
  it('hides off-workspace windows with display:none', () => {
    const { container } = render(<WindowFrame title="kitty" tiled rect={RECT} hidden><span>x</span></WindowFrame>);
    // display:none drops it from the a11y tree, so query the DOM directly.
    const frame = container.querySelector('[role="dialog"]');
    expect(frame.style.display).toBe('none');
  });

  it('honours the overview transform instead of its own rect', () => {
    render(
      <WindowFrame
        title="Firefox"
        tiled
        rect={RECT}
        overviewStyle={{ left: 200, top: 120, width: 400, height: 300, transform: 'scale(0.5)' }}
      >
        <span>x</span>
      </WindowFrame>,
    );
    const frame = screen.getByRole('dialog', { name: 'Firefox window' });
    expect(frame.style.left).toBe('200px');
    expect(frame.style.transform).toBe('scale(0.5)');
  });

  it('tints the title dot with the app colour', () => {
    const { container } = render(
      <WindowFrame title="Files" tiled rect={RECT} color="#e0af68"><span>x</span></WindowFrame>,
    );
    expect(container.querySelector('[role="dialog"]').style.getPropertyValue('--win-color')).toBe('#e0af68');
  });

  it('positions a tiled window at its rect', () => {
    render(<WindowFrame title="Files" tiled rect={RECT}><span>x</span></WindowFrame>);
    const frame = screen.getByRole('dialog', { name: 'Files window' });
    expect(frame.style.left).toBe('10px');
    expect(frame.style.top).toBe('50px');
    expect(frame.style.width).toBe('400px');
  });

  it('marks the active window with the active class', () => {
    render(<WindowFrame title="kitty" tiled rect={RECT} isActive><span>x</span></WindowFrame>);
    const frame = screen.getByRole('dialog', { name: 'kitty window' });
    expect(frame.className).toMatch(/active/);
  });
});
