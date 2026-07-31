/**
 * Theme palettes for the Hyprland-style shell.
 *
 * Each theme exposes a flat `palette` of named colors plus a small set of
 * semantic roles. `toCssVars()` flattens a theme into the CSS custom properties
 * consumed across the whole shell (waybar, window borders, launcher, terminal).
 *
 * Backward compatibility: the legacy terminal variables (--terminal-bg,
 * --phosphor-color, --color-success, ...) are emitted too, so existing Terminal
 * and app CSS keeps working unchanged while the new shell reads the richer set.
 */

/** @typedef {Record<string, string>} Palette */

/**
 * Build the semantic role map shared by every theme. Keeping this in one place
 * means a new palette only has to supply raw colors, not remember every role.
 * @param {Palette} p raw named palette
 * @param {object} roles role -> palette key
 */
function roles(p, r) {
  return {
    bg: p[r.bg],
    mantle: p[r.mantle],
    crust: p[r.crust],
    surface: p[r.surface],
    surfaceAlt: p[r.surfaceAlt],
    overlay: p[r.overlay],
    text: p[r.text],
    subtext: p[r.subtext],
    muted: p[r.muted],
    border: p[r.border],
    accent: p[r.accent],
    accent2: p[r.accent2],
    success: p[r.success],
    error: p[r.error],
    warning: p[r.warning],
    info: p[r.info],
  };
}

const catppuccinMocha = (() => {
  const p = {
    rosewater: '#f5e0dc', flamingo: '#f2cdcd', pink: '#f5c2e7', mauve: '#cba6f7',
    red: '#f38ba8', maroon: '#eba0ac', peach: '#fab387', yellow: '#f9e2af',
    green: '#a6e3a1', teal: '#94e2d5', sky: '#89dceb', sapphire: '#74c7ec',
    blue: '#89b4fa', lavender: '#b4befe',
    text: '#cdd6f4', subtext1: '#bac2de', subtext0: '#a6adc8',
    overlay2: '#9399b2', overlay1: '#7f849c', overlay0: '#6c7086',
    surface2: '#585b70', surface1: '#45475a', surface0: '#313244',
    base: '#1e1e2e', mantle: '#181825', crust: '#11111b',
  };
  return {
    id: 'catppuccin-mocha', label: 'Catppuccin Mocha', dark: true, palette: p,
    role: roles(p, {
      bg: 'base', mantle: 'mantle', crust: 'crust', surface: 'surface0',
      surfaceAlt: 'surface1', overlay: 'overlay0', text: 'text',
      subtext: 'subtext0', muted: 'overlay1', border: 'surface1',
      accent: 'mauve', accent2: 'blue', success: 'green', error: 'red',
      warning: 'yellow', info: 'sky',
    }),
  };
})();

const catppuccinLatte = (() => {
  const p = {
    rosewater: '#dc8a78', flamingo: '#dd7878', pink: '#ea76cb', mauve: '#8839ef',
    red: '#d20f39', maroon: '#e64553', peach: '#fe640b', yellow: '#df8e1d',
    green: '#40a02b', teal: '#179299', sky: '#04a5e5', sapphire: '#209fb5',
    blue: '#1e66f5', lavender: '#7287fd',
    text: '#4c4f69', subtext1: '#5c5f77', subtext0: '#6c6f85',
    overlay2: '#7c7f93', overlay1: '#8c8fa1', overlay0: '#9ca0b0',
    surface2: '#acb0be', surface1: '#bcc0cc', surface0: '#ccd0da',
    base: '#eff1f5', mantle: '#e6e9ef', crust: '#dce0e8',
  };
  return {
    id: 'catppuccin-latte', label: 'Catppuccin Latte', dark: false, palette: p,
    role: roles(p, {
      bg: 'base', mantle: 'mantle', crust: 'crust', surface: 'surface0',
      surfaceAlt: 'surface1', overlay: 'overlay0', text: 'text',
      subtext: 'subtext0', muted: 'overlay1', border: 'surface1',
      accent: 'mauve', accent2: 'blue', success: 'green', error: 'red',
      warning: 'yellow', info: 'sky',
    }),
  };
})();

const tokyoNight = (() => {
  const p = {
    bg: '#1a1b26', mantle: '#16161e', crust: '#13131a',
    surface0: '#24283b', surface1: '#292e42', overlay0: '#565f89',
    text: '#c0caf5', subtext0: '#a9b1d6', muted: '#565f89',
    red: '#f7768e', peach: '#ff9e64', yellow: '#e0af68', green: '#9ece6a',
    teal: '#73daca', sky: '#7dcfff', blue: '#7aa2f7', mauve: '#bb9af7',
  };
  return {
    id: 'tokyo-night', label: 'Tokyo Night', dark: true, palette: p,
    role: roles(p, {
      bg: 'bg', mantle: 'mantle', crust: 'crust', surface: 'surface0',
      surfaceAlt: 'surface1', overlay: 'overlay0', text: 'text',
      subtext: 'subtext0', muted: 'muted', border: 'surface1',
      accent: 'blue', accent2: 'mauve', success: 'green', error: 'red',
      warning: 'yellow', info: 'sky',
    }),
  };
})();

const gruvbox = (() => {
  const p = {
    bg: '#282828', mantle: '#1d2021', crust: '#1b1b1b',
    surface0: '#3c3836', surface1: '#504945', overlay0: '#665c54',
    text: '#ebdbb2', subtext0: '#d5c4a1', muted: '#928374',
    red: '#fb4934', peach: '#fe8019', yellow: '#fabd2f', green: '#b8bb26',
    teal: '#8ec07c', sky: '#83a598', blue: '#83a598', mauve: '#d3869b',
  };
  return {
    id: 'gruvbox', label: 'Gruvbox Dark', dark: true, palette: p,
    role: roles(p, {
      bg: 'bg', mantle: 'mantle', crust: 'crust', surface: 'surface0',
      surfaceAlt: 'surface1', overlay: 'overlay0', text: 'text',
      subtext: 'subtext0', muted: 'muted', border: 'surface1',
      accent: 'yellow', accent2: 'peach', success: 'green', error: 'red',
      warning: 'yellow', info: 'sky',
    }),
  };
})();

const nord = (() => {
  const p = {
    bg: '#2e3440', mantle: '#2b303b', crust: '#242933',
    surface0: '#3b4252', surface1: '#434c5e', overlay0: '#4c566a',
    text: '#eceff4', subtext0: '#d8dee9', muted: '#7b88a1',
    red: '#bf616a', peach: '#d08770', yellow: '#ebcb8b', green: '#a3be8c',
    teal: '#8fbcbb', sky: '#88c0d0', blue: '#81a1c1', mauve: '#b48ead',
  };
  return {
    id: 'nord', label: 'Nord', dark: true, palette: p,
    role: roles(p, {
      bg: 'bg', mantle: 'mantle', crust: 'crust', surface: 'surface0',
      surfaceAlt: 'surface1', overlay: 'overlay0', text: 'text',
      subtext: 'subtext0', muted: 'muted', border: 'surface1',
      accent: 'sky', accent2: 'blue', success: 'green', error: 'red',
      warning: 'yellow', info: 'teal',
    }),
  };
})();

const dracula = (() => {
  const p = {
    bg: '#282a36', mantle: '#21222c', crust: '#191a21',
    surface0: '#343746', surface1: '#44475a', overlay0: '#6272a4',
    text: '#f8f8f2', subtext0: '#e2e2dc', muted: '#6272a4',
    red: '#ff5555', peach: '#ffb86c', yellow: '#f1fa8c', green: '#50fa7b',
    teal: '#8be9fd', sky: '#8be9fd', blue: '#bd93f9', mauve: '#ff79c6',
  };
  return {
    id: 'dracula', label: 'Dracula', dark: true, palette: p,
    role: roles(p, {
      bg: 'bg', mantle: 'mantle', crust: 'crust', surface: 'surface0',
      surfaceAlt: 'surface1', overlay: 'overlay0', text: 'text',
      subtext: 'subtext0', muted: 'muted', border: 'surface1',
      accent: 'mauve', accent2: 'blue', success: 'green', error: 'red',
      warning: 'yellow', info: 'teal',
    }),
  };
})();

export const THEMES = {
  'catppuccin-mocha': catppuccinMocha,
  'catppuccin-latte': catppuccinLatte,
  'tokyo-night': tokyoNight,
  gruvbox,
  nord,
  dracula,
};

export const DEFAULT_THEME = 'catppuccin-mocha';

/** Ordered list for launcher/settings dropdowns. */
export const THEME_LIST = Object.values(THEMES).map((t) => ({ id: t.id, label: t.label }));

/** Resolve a theme by id, with graceful fallback to the default. */
export function getTheme(id) {
  return THEMES[id] || THEMES[DEFAULT_THEME];
}

/**
 * Flatten a theme into the CSS custom-property map applied to :root.
 * Emits both the new `--hypr-*` shell tokens and the legacy terminal vars.
 * @param {typeof catppuccinMocha} theme
 * @returns {Record<string, string>}
 */
export function toCssVars(theme) {
  const r = theme.role;
  return {
    // Shell tokens
    '--hypr-bg': r.bg,
    '--hypr-mantle': r.mantle,
    '--hypr-crust': r.crust,
    '--hypr-surface': r.surface,
    '--hypr-surface-alt': r.surfaceAlt,
    '--hypr-overlay': r.overlay,
    '--hypr-text': r.text,
    '--hypr-subtext': r.subtext,
    '--hypr-muted': r.muted,
    '--hypr-border': r.border,
    '--hypr-accent': r.accent,
    '--hypr-accent-2': r.accent2,
    '--hypr-red': r.error,
    '--hypr-green': r.success,
    '--hypr-yellow': r.warning,
    '--hypr-info': r.info,
    // Animated focus-border gradient endpoints (Hyprland signature)
    '--hypr-border-active': `linear-gradient(45deg, ${r.accent}, ${r.accent2})`,
    // Legacy terminal vars (keep existing components working)
    '--bg-color': r.bg,
    '--text-color': r.text,
    '--prompt-color': r.accent,
    '--admin-color': r.error,
    '--terminal-bg': r.crust,
    '--terminal-text': r.text,
    '--phosphor-color': r.accent,
    '--theme-bg': r.bg,
    '--theme-text': r.text,
    '--theme-accent': r.accent,
    '--theme-window': r.surface,
    '--theme-border': r.border,
    '--color-success': r.success,
    '--color-error': r.error,
    '--color-info': r.info,
    '--color-warning': r.warning,
  };
}
