import { describe, it, expect } from 'vitest';
import { getLevenshteinDistance, getFuzzyMatches } from '../utils/fuzzyMatch';

// ─── getLevenshteinDistance ───────────────────────────────────────────────────

describe('getLevenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(getLevenshteinDistance('help', 'help')).toBe(0);
  });

  it('returns full length when one string is empty', () => {
    expect(getLevenshteinDistance('', 'abc')).toBe(3);
    expect(getLevenshteinDistance('abc', '')).toBe(3);
  });

  it('handles single-character differences (substitution)', () => {
    // "cat" → "bat" = 1 substitution
    expect(getLevenshteinDistance('cat', 'bat')).toBe(1);
  });

  it('handles insertions', () => {
    // "help" → "helpo" = 1 insertion
    expect(getLevenshteinDistance('help', 'helpo')).toBe(1);
  });

  it('handles deletions', () => {
    // "about" → "abut" = 1 deletion
    expect(getLevenshteinDistance('about', 'abut')).toBe(1);
  });

  it('returns correct distance for completely different strings', () => {
    expect(getLevenshteinDistance('abc', 'xyz')).toBe(3);
  });

  it('is case-sensitive', () => {
    // 'Help' vs 'help' — H≠h
    expect(getLevenshteinDistance('Help', 'help')).toBe(1);
  });
});

// ─── getFuzzyMatches ─────────────────────────────────────────────────────────

describe('getFuzzyMatches', () => {
  const commands = ['help', 'about', 'projects', 'contact', 'clear', 'whoami', 'github'];

  it('returns an empty array for empty input', () => {
    expect(getFuzzyMatches('', commands)).toEqual([]);
  });

  it('returns top N closest matches (default 3)', () => {
    const results = getFuzzyMatches('halp', commands);
    expect(results).toHaveLength(3);
  });

  it('puts the closest command first (prefix bonus)', () => {
    // "hel" is a prefix of "help" → should rank first
    const results = getFuzzyMatches('hel', commands);
    expect(results[0]).toBe('help');
  });

  it('respects the custom limit parameter', () => {
    const results = getFuzzyMatches('a', commands, 2);
    expect(results).toHaveLength(2);
  });

  it('finds close typo matches', () => {
    // "proyects" is close to "projects" (1 substitution + 1 deletion)
    const results = getFuzzyMatches('proyects', commands);
    expect(results).toContain('projects');
  });

  it('works when input has leading/trailing whitespace', () => {
    const results = getFuzzyMatches('  help  ', commands);
    expect(results[0]).toBe('help');
  });
});
