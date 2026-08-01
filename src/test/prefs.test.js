import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getPref, setPref, clearPref } from '../utils/prefs';

describe('prefs', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('returns the fallback when nothing is stored', () => {
    expect(getPref('wallpaper', 'default-id')).toBe('default-id');
  });

  it('round-trips a value', () => {
    setPref('wallpaper', 'nord-aurora');
    expect(getPref('wallpaper')).toBe('nord-aurora');
  });

  it('namespaces keys so it cannot collide with other storage', () => {
    setPref('wallpaper', 'x');
    expect(localStorage.getItem('hypr_wallpaper')).toBe('x');
    expect(localStorage.getItem('wallpaper')).toBeNull();
  });

  it('clears a value', () => {
    setPref('wallpaper', 'x');
    clearPref('wallpaper');
    expect(getPref('wallpaper', 'fallback')).toBe('fallback');
  });

  it('falls back when storage throws on read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    expect(getPref('wallpaper', 'safe')).toBe('safe');
  });

  it('does not throw when storage throws on write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(() => setPref('wallpaper', 'x')).not.toThrow();
  });
});
