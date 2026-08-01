import { describe, it, expect } from 'vitest';
import { handleCommand } from '../utils/commandHandler';
import { THEMES } from '../theme/themes';

const run = (input) => handleCommand(input, { isAdmin: false, currentPath: '/portfolio', history: [] });
const flat = (out) => (Array.isArray(out.content) ? out.content.join('\n') : String(out.content));

describe('theme command', () => {
  it('lists every shipped palette', () => {
    const text = flat(run('theme'));
    for (const id of Object.keys(THEMES)) {
      expect(text, `missing ${id}`).toMatch(id);
    }
  });

  it('every offered theme id actually resolves', () => {
    for (const id of Object.keys(THEMES)) {
      const out = run(`theme ${id}`);
      expect(out.action, id).toBe('theme');
      expect(THEMES[out.theme], id).toBeDefined();
    }
  });

  it('accepts the friendly aliases', () => {
    expect(run('theme mocha').theme).toBe('catppuccin-mocha');
    expect(run('theme latte').theme).toBe('catppuccin-latte');
    expect(run('theme tokyo').theme).toBe('tokyo-night');
    expect(run('theme rose').theme).toBe('rose-pine');
  });

  it('is case-insensitive', () => {
    expect(run('theme GRUVBOX').theme).toBe('gruvbox');
  });

  it('reports unknown themes with the valid list', () => {
    const text = flat(run('theme neon-nightmare'));
    expect(text).toMatch(/Unknown theme/);
    expect(text).toMatch(/tokyo-night/);
  });

  it('color-scheme is an alias', () => {
    expect(run('color-scheme nord').theme).toBe('nord');
  });
});
