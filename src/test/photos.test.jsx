import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Photos from '../components/Photos';
import { WALLPAPERS } from '../data/wallpapers';

describe('<Photos> image viewer', () => {
  it('browses every bundled wallpaper', () => {
    render(<Photos />);
    expect(screen.getAllByRole('img')).toHaveLength(WALLPAPERS.length);
  });

  it('makes no external image requests', () => {
    render(<Photos />);
    for (const tile of screen.getAllByRole('img')) {
      const bg = tile.style.backgroundImage;
      expect(bg).not.toMatch(/https?:\/\//);
      expect(bg).toMatch(/wallpapers\/.+\.svg/);
    }
  });

  it('labels each tile with its name and palette', () => {
    render(<Photos />);
    const first = WALLPAPERS[0];
    expect(screen.getByRole('img', { name: `${first.name} — ${first.palette}` })).toBeInTheDocument();
  });

  it('opens a lightbox showing the chosen wallpaper', () => {
    render(<Photos />);
    const first = WALLPAPERS[0];
    fireEvent.click(screen.getByRole('img', { name: `${first.name} — ${first.palette}` }));
    const box = screen.getByRole('dialog', { name: `Lightbox: ${first.name} — ${first.palette}` });
    expect(box).toBeInTheDocument();
  });

  it('is keyboard operable', () => {
    render(<Photos />);
    const tiles = screen.getAllByRole('img');
    expect(tiles[0]).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(tiles[0], { key: 'Enter' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
