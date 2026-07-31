import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KeybindCheatsheet from '../shell/KeybindCheatsheet';

describe('<KeybindCheatsheet>', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<KeybindCheatsheet isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('lists core shortcuts when open', () => {
    render(<KeybindCheatsheet isOpen onClose={() => {}} />);
    expect(screen.getByText('Open app launcher')).toBeInTheDocument();
    expect(screen.getByText('Cycle window focus')).toBeInTheDocument();
    expect(screen.getByText('Switch workspace')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<KeybindCheatsheet isOpen onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
