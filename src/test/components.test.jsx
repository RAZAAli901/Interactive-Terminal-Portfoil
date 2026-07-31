import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DesktopIcon from '../components/DesktopIcon';
import MobileBar from '../shell/MobileBar';

describe('<DesktopIcon>', () => {
  it('renders its label', () => {
    render(<DesktopIcon label="kitty" icon="💻" onDoubleClick={() => {}} />);
    expect(screen.getByText('kitty')).toBeInTheDocument();
  });

  it('fires onDoubleClick when double-clicked', () => {
    const onDoubleClick = vi.fn();
    render(<DesktopIcon label="Files" icon="📁" onDoubleClick={onDoubleClick} />);
    fireEvent.doubleClick(screen.getByText('Files'));
    expect(onDoubleClick).toHaveBeenCalled();
  });
});

describe('<MobileBar>', () => {
  it('shows the user@host and a clock', () => {
    render(<MobileBar />);
    expect(screen.getByText('razaali@arch')).toBeInTheDocument();
    expect(screen.getByText(/^\d{2}:\d{2}$/)).toBeInTheDocument();
  });
});
