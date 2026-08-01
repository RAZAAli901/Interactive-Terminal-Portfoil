import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { fireEvent, render, screen, act } from '@testing-library/react';
import { ThemeProvider } from '../theme/ThemeProvider';
import App from '../App';

// jsdom has no canvas backend; the neural-network background only needs the
// context calls to be harmless no-ops.
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
    stroke: vi.fn(), arc: vi.fn(), fill: vi.fn(), setTransform: vi.fn(),
    strokeStyle: '', fillStyle: '', lineWidth: 1,
  }));
  window.matchMedia ||= vi.fn().mockImplementation((q) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn(),
  }));
});

afterEach(() => vi.restoreAllMocks());

const renderApp = () => render(<ThemeProvider><App /></ThemeProvider>);

describe('App smoke', () => {
  it('boots to the BIOS screen without console errors', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderApp();
    expect(screen.getByText(/American Megatrends/)).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });

  it('reaches the desktop after logging in, with no hook-order violations', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderApp();

    // Skip BIOS -> systemd, then log in.
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Enter' });
      await new Promise((r) => setTimeout(r, 400));
    });
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Enter' });
      await new Promise((r) => setTimeout(r, 700));
    });
    const login = screen.queryByLabelText('Log in');
    if (login) {
      await act(async () => {
        fireEvent.click(login);
        await new Promise((r) => setTimeout(r, 700));
      });
    }

    expect(screen.getByLabelText('Status bar')).toBeInTheDocument();

    const hookErrors = spy.mock.calls.filter((c) => String(c[0]).includes('order of Hooks'));
    expect(hookErrors, 'React reported a hook-order violation').toHaveLength(0);
  });

  it('renders the desktop shell surfaces', async () => {
    renderApp();
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Enter' });
      await new Promise((r) => setTimeout(r, 400));
    });
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Enter' });
      await new Promise((r) => setTimeout(r, 700));
    });
    const login = screen.queryByLabelText('Log in');
    if (login) {
      await act(async () => {
        fireEvent.click(login);
        await new Promise((r) => setTimeout(r, 700));
      });
    }

    expect(screen.getAllByRole('tab')).toHaveLength(5);
    expect(screen.getByLabelText('Launch kitty')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle window overview')).toBeInTheDocument();
  });
});
