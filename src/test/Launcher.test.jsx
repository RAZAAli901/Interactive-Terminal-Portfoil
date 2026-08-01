import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Launcher from '../shell/Launcher';

describe('<Launcher>', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<Launcher isOpen={false} onLaunch={() => {}} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('lists enabled apps when open', () => {
    render(<Launcher isOpen onLaunch={() => {}} onClose={() => {}} />);
    expect(screen.getAllByText('kitty').length).toBeGreaterThan(0);
    expect(screen.getByText('Firefox')).toBeInTheDocument();
  });

  it('filters the list as the user types', () => {
    render(<Launcher isOpen onLaunch={() => {}} onClose={() => {}} />);
    const input = screen.getByLabelText('Search applications');
    fireEvent.change(input, { target: { value: 'fire' } });
    expect(screen.getByText('Firefox')).toBeInTheDocument();
    expect(screen.queryByText('kitty')).not.toBeInTheDocument();
  });

  it('launches the selected app on Enter', () => {
    const onLaunch = vi.fn();
    render(<Launcher isOpen onLaunch={onLaunch} onClose={() => {}} />);
    const input = screen.getByLabelText('Search applications');
    fireEvent.change(input, { target: { value: 'firefox' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    // Searching the exec name resolves to the app's window id.
    expect(onLaunch).toHaveBeenCalledWith('browser');
  });

  it('matches on the exec command as well as the title', () => {
    render(<Launcher isOpen onLaunch={() => {}} onClose={() => {}} />);
    const input = screen.getByLabelText('Search applications');
    fireEvent.change(input, { target: { value: 'thunar' } });
    expect(screen.getByText('Files')).toBeInTheDocument();
  });
});
