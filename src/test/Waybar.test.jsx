import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Waybar from '../shell/Waybar';

describe('<Waybar>', () => {
  it('renders five workspace pills', () => {
    render(<Waybar activeWorkspace={1} occupied={new Set()} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(5);
  });

  it('marks the active workspace selected', () => {
    render(<Waybar activeWorkspace={3} occupied={new Set()} />);
    const tab3 = screen.getByRole('tab', { name: 'Workspace 3' });
    expect(tab3).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onWorkspace when a pill is clicked', () => {
    const onWorkspace = vi.fn();
    render(<Waybar activeWorkspace={1} occupied={new Set()} onWorkspace={onWorkspace} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Workspace 4' }));
    expect(onWorkspace).toHaveBeenCalledWith(4);
  });

  it('calls onLauncher from the Arch button', () => {
    const onLauncher = vi.fn();
    render(<Waybar activeWorkspace={1} occupied={new Set()} onLauncher={onLauncher} />);
    fireEvent.click(screen.getByLabelText('Open application launcher'));
    expect(onLauncher).toHaveBeenCalled();
  });

  it('shows the focused window title', () => {
    render(<Waybar activeWorkspace={1} occupied={new Set()} focusedTitle="Firefox" />);
    expect(screen.getByText('Firefox')).toBeInTheDocument();
  });
});
