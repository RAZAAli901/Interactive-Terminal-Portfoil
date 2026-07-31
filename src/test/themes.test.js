import { describe, it, expect } from 'vitest';
import { THEMES, DEFAULT_THEME, getTheme, toCssVars } from '../theme/themes';

describe('themes', () => {
  it('has a valid default theme', () => {
    expect(THEMES[DEFAULT_THEME]).toBeDefined();
    expect(DEFAULT_THEME).toBe('catppuccin-mocha');
  });

  it('getTheme falls back to the default for unknown ids', () => {
    expect(getTheme('does-not-exist').id).toBe(DEFAULT_THEME);
    expect(getTheme('gruvbox').id).toBe('gruvbox');
  });

  it('toCssVars emits both shell and legacy terminal variables', () => {
    const vars = toCssVars(getTheme('catppuccin-mocha'));
    expect(vars['--hypr-bg']).toBe('#1e1e2e');
    expect(vars['--hypr-accent']).toBeTruthy();
    // legacy vars kept for existing terminal/app CSS
    expect(vars['--terminal-bg']).toBeTruthy();
    expect(vars['--color-success']).toBeTruthy();
  });

  it('every theme resolves a full set of role colors', () => {
    for (const theme of Object.values(THEMES)) {
      const vars = toCssVars(theme);
      for (const key of ['--hypr-bg', '--hypr-text', '--hypr-accent', '--hypr-border', '--hypr-red', '--hypr-green']) {
        expect(vars[key], `${theme.id} ${key}`).toMatch(/^#|^linear-gradient/);
      }
    }
  });
});
