import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BiosScreen from '../boot/BiosScreen';
import SystemdBoot from '../boot/SystemdBoot';
import SddmLogin from '../login/SddmLogin';
import BootSequence from '../boot/BootSequence';

describe('boot sequence', () => {
  it('BIOS screen shows POST details', () => {
    render(<BiosScreen onDone={() => {}} />);
    expect(screen.getByText(/American Megatrends/)).toBeInTheDocument();
    expect(screen.getByText(/Memory Test/)).toBeInTheDocument();
  });

  it('systemd boot shows the tty banner', () => {
    const { container } = render(<SystemdBoot onDone={() => {}} />);
    expect(container.textContent).toMatch(/Arch Linux 6\.9/);
  });

  it('SDDM login shows the user and Hyprland session', () => {
    render(<SddmLogin wallpaper="" onLogin={() => {}} />);
    expect(screen.getByText('razaali')).toBeInTheDocument();
    expect(screen.getByText('Hyprland')).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
  });

  it('SDDM login calls onLogin after the fade', () => {
    vi.useFakeTimers();
    const onLogin = vi.fn();
    render(<SddmLogin wallpaper="" onLogin={onLogin} />);
    fireEvent.click(screen.getByLabelText('Log in'));
    vi.advanceTimersByTime(400);
    expect(onLogin).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('BootSequence starts at the BIOS stage', () => {
    render(<BootSequence wallpaper="" onComplete={() => {}} />);
    expect(screen.getByText(/American Megatrends/)).toBeInTheDocument();
  });

  it('BootSequence can start at the login stage', () => {
    render(<BootSequence wallpaper="" onComplete={() => {}} startStage="login" />);
    expect(screen.getByText('razaali')).toBeInTheDocument();
  });
});
