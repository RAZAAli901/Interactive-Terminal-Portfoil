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

  it('covers the viewport when fullscreen', () => {
    render(<WindowFrame title="Firefox" fullscreen rect={RECT}><span>x</span></WindowFrame>);
    const frame = screen.getByRole('dialog', { name: 'Firefox window' });
    expect(frame.style.width).toBe('100vw');
    expect(frame.style.height).toBe('100vh');
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
