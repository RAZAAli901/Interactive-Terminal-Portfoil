import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    render(<WindowFrame title="kitty" tiled rect={RECT}><span>x</span></WindowFrame>);
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximize')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle floating')).toBeInTheDocument();
  });

  it('labels the dialog by its title', () => {
    render(<WindowFrame title="Files" tiled rect={RECT}><span>x</span></WindowFrame>);
    expect(screen.getByRole('dialog', { name: 'Files window' })).toBeInTheDocument();
  });
});
