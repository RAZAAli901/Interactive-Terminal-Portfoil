import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../theme/ThemeProvider';
import Settings from '../components/Settings';

const renderSettings = () =>
  render(
    <ThemeProvider>
      <Settings setWallpaper={() => {}} currentWallpaper={4} />
    </ThemeProvider>,
  );

describe('<Settings>', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.perf;
  });

  it('switches the theme from the personalization picker', () => {
    renderSettings();
    fireEvent.click(screen.getByText(/Personalization/));
    fireEvent.click(screen.getByText('Gruvbox Dark'));
    expect(document.documentElement.dataset.theme).toBe('gruvbox');
  });

  it('toggles low-power mode', () => {
    renderSettings();
    const btn = screen.getByText('Off');
    fireEvent.click(btn);
    expect(document.documentElement.dataset.perf).toBe('low');
  });

  it('shows Arch/Hyprland system info', () => {
    renderSettings();
    expect(screen.getByText('Hyprland (Wayland)')).toBeInTheDocument();
    expect(screen.getByText('Arch Linux (rolling)')).toBeInTheDocument();
  });
});
