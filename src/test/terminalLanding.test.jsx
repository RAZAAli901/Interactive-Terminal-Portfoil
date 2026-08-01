import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Terminal from '../components/Terminal';

beforeAll(() => {
  window.matchMedia ||= vi.fn().mockImplementation((q) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn(),
  }));
});

describe('terminal landing view', () => {
  it('opens with the rendered neofetch card, not plain text', async () => {
    const { container } = render(<Terminal setTheme={() => {}} setWallpaper={() => {}} />);

    // The ASCII logo is a real <pre>, which is how we know the React panel
    // rendered rather than the plain-text `fastfetch` command output.
    await waitFor(() => {
      expect(container.querySelector('pre')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('shows the Arch / Hyprland system info', async () => {
    const { container } = render(<Terminal setTheme={() => {}} setWallpaper={() => {}} />);
    // The banner types out first; the neofetch card lands once it finishes.
    await waitFor(() => {
      expect(container.textContent).toMatch(/Hyprland/);
    }, { timeout: 8000 });
    expect(container.textContent).toMatch(/Arch Linux/);
  });

  it('greets with the kitty banner', async () => {
    render(<Terminal setTheme={() => {}} setWallpaper={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText(/kitty/)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
