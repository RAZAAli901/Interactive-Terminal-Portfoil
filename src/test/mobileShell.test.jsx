import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from '../theme/ThemeProvider';
import App from '../App';

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
    stroke: vi.fn(), arc: vi.fn(), fill: vi.fn(), setTransform: vi.fn(),
  }));
  window.matchMedia ||= vi.fn().mockImplementation((q) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn(),
  }));
});

const setWidth = (w) => {
  window.innerWidth = w;
  act(() => { window.dispatchEvent(new Event('resize')); });
};

beforeEach(() => localStorage.clear());
afterEach(() => { setWidth(1440); vi.restoreAllMocks(); });

/** Nudge each boot stage along until `done()` reports the desktop is up. */
async function boot(done) {
  await waitFor(() => {
    const login = screen.queryByLabelText('Log in');
    if (login) fireEvent.click(login);
    else fireEvent.keyDown(window, { key: 'Enter' });
    expect(done()).toBeTruthy();
  }, { timeout: 10000, interval: 120 });
}

describe('mobile shell', () => {
  it('serves a terminal-first shell on a phone viewport', async () => {
    setWidth(375);
    render(<ThemeProvider><App /></ThemeProvider>);
    await boot(() => screen.queryByText('raza@arch'));

    // The tiling chrome is desktop-only.
    expect(screen.queryByLabelText('Status bar')).toBeNull();
    expect(screen.queryByLabelText('Launch kitty')).toBeNull();
    // …and the terminal identity bar is present instead.
    expect(screen.getByText('raza@arch')).toBeInTheDocument();
  });

  it('shows the full desktop on a wide viewport', async () => {
    setWidth(1440);
    render(<ThemeProvider><App /></ThemeProvider>);
    await boot(() => screen.queryByLabelText('Status bar'));

    expect(screen.getByLabelText('Status bar')).toBeInTheDocument();
    expect(screen.getByLabelText('Launch kitty')).toBeInTheDocument();
  });
});
