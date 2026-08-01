import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import WindowFrame from '../wm/WindowFrame';

const RECT = { x: 10, y: 50, w: 400, h: 300 };

describe('<WindowFrame>', () => {
  it('renders its title and content (tiled avoids the drag path)', () => {
    render(
      <WindowFrame title="Firefox" tiled rect={RECT} isActive>
        <p>page content</p>
      </WindowFrame>,
    );
    expect(screen.getByText('Firefox')).toBeInTheDocument();
    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('exposes window controls', () => {
    render(
      <WindowFrame title="kitty" tiled rect={RECT} onMinimize={() => {}}>
        <span>x</span>
      </WindowFrame>,
    );
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
    expect(screen.getByLabelText('Minimize')).toBeInTheDocument();
  });

  it('omits the minimize button when no handler is given', () => {
    render(<WindowFrame title="kitty" tiled rect={RECT}><span>x</span></WindowFrame>);
    expect(screen.queryByLabelText('Minimize')).not.toBeInTheDocument();
  });

  it('starts a drag from the title bar', () => {
    const onDragStart = vi.fn();
    render(
      <WindowFrame title="kitty" tiled rect={RECT} onDragStart={onDragStart}>
        <span>x</span>
      </WindowFrame>,
    );
    fireEvent.mouseDown(screen.getByText('kitty'), { button: 0 });
    expect(onDragStart).toHaveBeenCalled();
  });

  it('does not start a drag from the close button', () => {
    const onDragStart = vi.fn();
    render(
      <WindowFrame title="kitty" tiled rect={RECT} onDragStart={onDragStart}>
        <span>x</span>
      </WindowFrame>,
    );
    fireEvent.mouseDown(screen.getByLabelText('Close'), { button: 0 });
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('labels the dialog by its title', () => {
    render(<WindowFrame title="Files" tiled rect={RECT}><span>x</span></WindowFrame>);
    expect(screen.getByRole('dialog', { name: 'Files window' })).toBeInTheDocument();
  });
});
