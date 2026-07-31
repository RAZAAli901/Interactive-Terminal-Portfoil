import { describe, it, expect } from 'vitest';
import { subsequenceScore, searchApps } from '../shell/launcherSearch';

describe('subsequenceScore edge cases', () => {
  it('rewards a contiguous match over a scattered one', () => {
    expect(subsequenceScore('cat', 'catppuccin')).toBeGreaterThan(subsequenceScore('cat', 'caveat'));
  });

  it('is case-sensitive on the given inputs (callers lowercase first)', () => {
    expect(subsequenceScore('AB', 'ab')).toBe(-1);
  });

  it('handles a query longer than the text', () => {
    expect(subsequenceScore('firefoxx', 'firefox')).toBe(-1);
  });
});

describe('searchApps ranking', () => {
  const apps = [
    { name: 'Settings', exec: 'nwg-look' },
    { name: 'Screenshot', exec: 'grim' },
    { name: 'Solitaire', exec: 'sol' },
  ];

  it('ranks the tighter prefix match first', () => {
    const res = searchApps('se', apps);
    expect(res[0].name).toBe('Settings');
  });

  it('returns a stable array reference contract (new array)', () => {
    const res = searchApps('', apps);
    expect(res).toHaveLength(3);
    expect(res).toEqual(apps);
  });
});
