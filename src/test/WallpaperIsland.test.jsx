import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import WallpaperIsland from '../shell/WallpaperIsland';
import { WALLPAPERS } from '../data/wallpapers';

const setup = (props = {}) => {
  const onSelect = vi.fn();
  const onPreview = vi.fn();
  const utils = render(
    <WallpaperIsland
      wallpapers={WALLPAPERS}
      current={WALLPAPERS[0].id}
      onSelect={onSelect}
      onPreview={onPreview}
      {...props}
    />,
  );
  const capsule = screen.getByRole('button', { name: /Open switcher/ });
  return { onSelect, onPreview, capsule, ...utils };
};

describe('<WallpaperIsland> — open / close', () => {
  it('starts collapsed with the panel hidden', () => {
    setup();
    const capsule = screen.getByRole('button', { name: /Open switcher/ });
    expect(capsule).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('aria-hidden', 'true');
  });

  it('opens on click and closes again', () => {
    const { capsule } = setup();
    fireEvent.click(capsule);
    expect(capsule).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-hidden', 'false');
    fireEvent.click(capsule);
    expect(capsule).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes and clears the preview on the close button', () => {
    const { capsule, onPreview } = setup();
    fireEvent.click(capsule);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('button', { name: /Open switcher/ })).toHaveAttribute('aria-expanded', 'false');
    expect(onPreview).toHaveBeenLastCalledWith(null);
  });

  it('closes on Escape', () => {
    const { capsule } = setup();
    fireEvent.click(capsule);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByRole('button', { name: /Open switcher/ })).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('<WallpaperIsland> — thumbnails', () => {
  it('lists every wallpaper as an option', () => {
    const { capsule } = setup();
    fireEvent.click(capsule);
    expect(screen.getAllByRole('option')).toHaveLength(WALLPAPERS.length);
  });

  it('marks the current wallpaper selected', () => {
    const { capsule } = setup({ current: WALLPAPERS[3].id });
    fireEvent.click(capsule);
    const selected = screen.getAllByRole('option').filter((o) => o.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveAccessibleName(`${WALLPAPERS[3].name} — ${WALLPAPERS[3].palette}`);
  });

  it('applies a wallpaper when its thumbnail is clicked', () => {
    const { capsule, onSelect } = setup();
    fireEvent.click(capsule);
    const target = WALLPAPERS[7];
    fireEvent.click(screen.getByRole('option', { name: `${target.name} — ${target.palette}` }));
    expect(onSelect).toHaveBeenCalledWith(target.id);
  });
});

describe('<WallpaperIsland> — preview', () => {
  it('previews a wallpaper on hover and reverts when the pointer leaves the grid', () => {
    const { capsule, onPreview } = setup();
    fireEvent.click(capsule);
    const target = WALLPAPERS[5];
    const thumb = screen.getByRole('option', { name: `${target.name} — ${target.palette}` });
    fireEvent.mouseOver(thumb);
    expect(onPreview).toHaveBeenCalledWith(target.id);

    fireEvent.mouseLeave(screen.getByRole('listbox'));
    expect(onPreview).toHaveBeenLastCalledWith(null);
  });
});

describe('<WallpaperIsland> — shuffle', () => {
  it('shuffles to a different wallpaper', () => {
    const { capsule, onSelect } = setup({ current: WALLPAPERS[0].id });
    fireEvent.click(capsule);
    fireEvent.click(screen.getByRole('button', { name: 'Shuffle wallpaper' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).not.toBe(WALLPAPERS[0].id);
    expect(WALLPAPERS.some((w) => w.id === onSelect.mock.calls[0][0])).toBe(true);
  });
});

describe('<WallpaperIsland> — keyboard grid', () => {
  it('moves the selection and previews with the arrow keys', () => {
    const { capsule, onPreview } = setup({ current: WALLPAPERS[0].id });
    fireEvent.click(capsule);
    const grid = screen.getByRole('listbox');
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(onPreview).toHaveBeenLastCalledWith(WALLPAPERS[1].id);
    fireEvent.keyDown(grid, { key: 'ArrowDown' }); // +3 columns
    expect(onPreview).toHaveBeenLastCalledWith(WALLPAPERS[4].id);
  });

  it('selects the highlighted wallpaper on Enter', () => {
    const { capsule, onSelect } = setup({ current: WALLPAPERS[0].id });
    fireEvent.click(capsule);
    const grid = screen.getByRole('listbox');
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    fireEvent.keyDown(grid, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(WALLPAPERS[1].id);
  });

  it('jumps to the ends with Home and End', () => {
    const { capsule, onPreview } = setup();
    fireEvent.click(capsule);
    const grid = screen.getByRole('listbox');
    fireEvent.keyDown(grid, { key: 'End' });
    expect(onPreview).toHaveBeenLastCalledWith(WALLPAPERS[WALLPAPERS.length - 1].id);
    fireEvent.keyDown(grid, { key: 'Home' });
    expect(onPreview).toHaveBeenLastCalledWith(WALLPAPERS[0].id);
  });
});
