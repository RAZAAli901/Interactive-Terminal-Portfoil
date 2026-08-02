import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import DesktopMenu from '../shell/DesktopMenu';
import { WALLPAPERS } from '../data/wallpapers';

const setup = (over = {}) => {
  const props = {
    x: 100, y: 100, wallpapers: WALLPAPERS, current: WALLPAPERS[0].id,
    onSelect: vi.fn(), onShuffle: vi.fn(), onNext: vi.fn(), onClose: vi.fn(),
    ...over,
  };
  return { props, ...render(<DesktopMenu {...props} />) };
};

describe('<DesktopMenu>', () => {
  it('offers shuffle and next actions', () => {
    setup();
    expect(screen.getByRole('menuitem', { name: /Shuffle wallpaper/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Next wallpaper/ })).toBeInTheDocument();
  });

  it('shows a swatch per wallpaper with the current one selected', () => {
    setup({ current: WALLPAPERS[2].id });
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(WALLPAPERS.length);
    const selected = options.filter((o) => o.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveAccessibleName(`${WALLPAPERS[2].name} — ${WALLPAPERS[2].palette}`);
  });

  it('shuffles then closes', () => {
    const { props } = setup();
    fireEvent.click(screen.getByRole('menuitem', { name: /Shuffle wallpaper/ }));
    expect(props.onShuffle).toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });

  it('advances then closes', () => {
    const { props } = setup();
    fireEvent.click(screen.getByRole('menuitem', { name: /Next wallpaper/ }));
    expect(props.onNext).toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });

  it('selects a wallpaper from a swatch and closes', () => {
    const { props } = setup();
    const target = WALLPAPERS[9];
    fireEvent.click(screen.getByRole('option', { name: `${target.name} — ${target.palette}` }));
    expect(props.onSelect).toHaveBeenCalledWith(target.id);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const { props } = setup();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('closes on an outside click', () => {
    const { props } = setup();
    fireEvent.mouseDown(document.body);
    expect(props.onClose).toHaveBeenCalled();
  });
});
