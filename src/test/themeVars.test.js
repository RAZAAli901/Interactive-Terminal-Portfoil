import { describe, it, expect } from 'vitest';
import { THEMES, toCssVars } from '../theme/themes';

describe('toCssVars — shell variables', () => {
  it('produces an animated active-border gradient for every theme', () => {
    for (const theme of Object.values(THEMES)) {
      const vars = toCssVars(theme);
      expect(vars['--hypr-border-active'], theme.id).toMatch(/^linear-gradient\(/);
    }
  });

  it('maps legacy terminal vars to the theme colors', () => {
    const vars = toCssVars(THEMES.gruvbox);
    expect(vars['--terminal-bg']).toBe(THEMES.gruvbox.role.crust);
    expect(vars['--phosphor-color']).toBe(THEMES.gruvbox.role.accent);
  });

  it('emits every documented shell token', () => {
    const vars = toCssVars(THEMES['catppuccin-mocha']);
    const required = ['--hypr-bg', '--hypr-surface', '--hypr-overlay', '--hypr-text', '--hypr-subtext', '--hypr-muted', '--hypr-border', '--hypr-accent', '--hypr-accent-2'];
    for (const key of required) expect(vars[key], key).toBeTruthy();
  });
});
