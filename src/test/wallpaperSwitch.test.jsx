import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from '../theme/ThemeProvider';
import App from '../App';
import { WALLPAPERS, wallpaperUrl } from '../data/wallpapers';

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

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

const bootToDesktop = async () => {
  await waitFor(() => {
    const login = screen.queryByLabelText('Log in');
    if (login) fireEvent.click(login);
    else fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByLabelText('Status bar')).toBeInTheDocument();
  }, { timeout: 10000, interval: 120 });
};

/** Open Settings from the launcher column and switch to its wallpaper tab. */
const openWallpaperPicker = async () => {
  await act(async () => { fireEvent.keyDown(window, { key: 'd', metaKey: true }); });
  const input = await screen.findByLabelText('Search applications');
  await act(async () => {
    fireEvent.change(input, { target: { value: 'settings' } });
    fireEvent.keyDown(input, { key: 'Enter' });
  });
  const tab = await screen.findByText(/Personalization/);
  await act(async () => { fireEvent.click(tab); });
  await screen.findByText('Desktop Wallpaper');
};

/** The visible wallpaper is the background-image on the fade layer. */
const shownWallpaper = (container) => {
  const layer = container.querySelector('[class*="wallpaperFade"]');
  return layer?.style.backgroundImage || '';
};

describe('changing the wallpaper', () => {
  it('applies the picked wallpaper to the desktop', async () => {
    const { container } = render(<ThemeProvider><App /></ThemeProvider>);
    await bootToDesktop();
    await openWallpaperPicker();

    const before = shownWallpaper(container);
    expect(before).toContain(WALLPAPERS[0].file);

    // Pick a clearly different wallpaper by its accessible label.
    const target = WALLPAPERS[7];
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: `${target.name} — ${target.palette}` }));
    });

    expect(shownWallpaper(container)).toContain(target.file);
    expect(shownWallpaper(container)).not.toBe(before);
  });

  it('remounts the fade layer per wallpaper so the change is never masked by a transition', async () => {
    const { container } = render(<ThemeProvider><App /></ThemeProvider>);
    await bootToDesktop();
    await openWallpaperPicker();

    const target = WALLPAPERS[3];
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: `${target.name} — ${target.palette}` }));
    });

    const layer = container.querySelector('[class*="wallpaperFade"]');
    // The url() serialization may or may not be quoted; assert on the file.
    expect(layer.style.backgroundImage).toContain(wallpaperUrl(target.id));
    // The layer must carry no `background-image` transition — url() is not
    // interpolable and would pin the computed style to the old image.
    expect(layer.style.transitionProperty).not.toContain('background-image');
  });

  it('persists the choice across reloads', async () => {
    const target = WALLPAPERS[10];
    const first = render(<ThemeProvider><App /></ThemeProvider>);
    await bootToDesktop();
    await openWallpaperPicker();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: `${target.name} — ${target.palette}` }));
    });
    first.unmount();

    // A fresh mount reads the stored preference.
    const { container } = render(<ThemeProvider><App /></ThemeProvider>);
    await bootToDesktop();
    expect(shownWallpaper(container)).toContain(target.file);
  });
});
