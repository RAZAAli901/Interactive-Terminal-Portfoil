import { describe, it, expect } from 'vitest';
import { subsequenceScore, searchApps } from '../shell/launcherSearch';

describe('subsequenceScore', () => {
  it('returns 0 for an empty query', () => {
    expect(subsequenceScore('', 'firefox')).toBe(0);
  });

  it('returns -1 when the query is not a subsequence', () => {
    expect(subsequenceScore('xyz', 'firefox')).toBe(-1);
  });

  it('matches a subsequence and rewards consecutive characters', () => {
    expect(subsequenceScore('fire', 'firefox')).toBeGreaterThan(subsequenceScore('fox', 'firefox'));
  });
});

const APPS = [
  { name: 'Firefox', exec: 'firefox' },
  { name: 'Files', exec: 'thunar' },
  { name: 'kitty', exec: 'kitty' },
];

describe('searchApps', () => {
  it('returns all apps for an empty query', () => {
    expect(searchApps('', APPS)).toHaveLength(3);
  });

  it('ranks a prefix match first', () => {
    const res = searchApps('fi', APPS);
    expect(res[0].name).toMatch(/^Fi/);
  });

  it('matches against the exec string too', () => {
    const res = searchApps('thunar', APPS);
    expect(res[0].name).toBe('Files');
  });

  it('drops non-matches', () => {
    expect(searchApps('zzz', APPS)).toHaveLength(0);
  });
});
