import { describe, it, expect } from 'vitest';
import { handleCommand } from '../utils/commandHandler';
import { WALLPAPERS } from '../data/wallpapers';

const run = (input) => handleCommand(input, { isAdmin: false, currentPath: '/portfolio', history: [] });
const flat = (out) => (Array.isArray(out.content) ? out.content.join('\n') : String(out.content));

describe('wallpaper command', () => {
  it('lists the bundled wallpapers with no arguments', () => {
    const text = flat(run('wallpaper'));
    expect(text).toMatch(/tokyo-night-skyline/);
    expect(text).toMatch(/nord-aurora/);
  });

  it('sets a wallpaper by exact id', () => {
    const out = run('wallpaper gruvbox-sun');
    expect(out.action).toBe('wallpaper');
    expect(out.wallpaper).toBe('gruvbox-sun');
  });

  it('accepts a partial name', () => {
    expect(run('wallpaper aurora').wallpaper).toBe('nord-aurora');
  });

  it('picks a real wallpaper for `random`', () => {
    const out = run('wallpaper random');
    expect(WALLPAPERS.some((w) => w.id === out.wallpaper)).toBe(true);
  });

  it('reports unknown wallpapers', () => {
    expect(flat(run('wallpaper nope-not-real'))).toMatch(/Unknown wallpaper/);
  });

  it('swww is an alias', () => {
    expect(run('swww gruvbox-sun').wallpaper).toBe('gruvbox-sun');
  });
});
