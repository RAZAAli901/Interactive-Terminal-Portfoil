import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PowerMenu from '../shell/PowerMenu';

describe('<PowerMenu>', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<PowerMenu isOpen={false} onClose={() => {}} onAction={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows the four power actions', () => {
    render(<PowerMenu isOpen onClose={() => {}} onAction={() => {}} />);
    ['Lock', 'Logout', 'Reboot', 'Shutdown'].forEach((label) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  });

  it('fires onAction with the chosen action id', () => {
    const onAction = vi.fn();
    render(<PowerMenu isOpen onClose={() => {}} onAction={onAction} />);
    fireEvent.click(screen.getByLabelText('Reboot'));
    expect(onAction).toHaveBeenCalledWith('reboot');
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<PowerMenu isOpen onClose={onClose} onAction={() => {}} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
