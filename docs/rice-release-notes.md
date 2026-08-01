# Tokyo Night Rice — release notes

The desktop was rebuilt from the `design_handoff_terminal_desktop` spec. This is
what changed, and what to look at first.

## Try it in this order

1. **Boot** — BIOS/POST → systemd log → SDDM login. Any key skips a stage.
2. **`Ctrl+Q`** a few times — each press spawns a terminal, and they dwindle-tile.
3. **Drag a gap** between two windows — the split re-ratios live.
4. **Drag a title bar** onto another window — a ghost follows the cursor, the
   target outlines, and releasing swaps the two panes.
5. **`Ctrl+\``** — hyprexpo overview. Arrow keys select, Enter focuses, Esc exits.
6. **`Super+D`** — wofi launcher. **`Super+/`** — every keybinding.
7. **`wallpaper random`** in the terminal, or `theme gruvbox`.

## What's new

### Window manager
- A real **binary space partition tree** (`src/layout/bsp.js`) replaces the old
  fixed-spiral tiler. Insert splits the focused pane along its longer axis;
  close collapses the parent into its sibling.
- **Drag-to-resize** on every gap (ratio clamped 0.12–0.88), plus arrow-key
  resizing for keyboard users.
- **Drag-to-swap** title bars, with a cursor ghost and a dashed drop outline.
- **Floating mode** with free drag and a corner grip; switching modes preserves
  where windows are on screen.
- **Five workspaces, each with its own tree.** Windows on other workspaces stay
  mounted and hidden, so terminal scrollback and scroll position survive a
  workspace switch.
- **Overview** (hyprexpo) scaling every window into a grid.

### Shell
Top bar (workspace pills, overview, layout toggle, clock, live telemetry,
power) · bottom dock · left launcher column · wofi search launcher ·
mako-style notifications · animated neural-network canvas background.

### Look
Tokyo Night is now the default of seven runtime-switchable palettes. Windows use
glass + `saturate(1.3)` blur, an 11px radius, an accent focus ring and a 34px
title bar with a per-app colour dot — all driven by CSS custom properties, so a
theme switch re-skins every surface at once.

### Wallpapers
**Twenty original SVG rice wallpapers** replace the twelve hotlinked Unsplash
photos. They are hand-authored vectors (a few KB each, crisp at any resolution,
no third-party licensing), covering Tokyo Night, Catppuccin, Gruvbox, Nord,
Everforest, Rosé Pine, Dracula and minimal/terminal styles. The image viewer
browses them and the picker lives in Settings; `wallpaper <name>` and
`wallpaper random` work from the terminal. The desktop makes **no external image
requests**.

### Terminal
Still a real shell. It now opens on a rendered neofetch card and gained
`hyprctl`, `btop`, `htop`, `cava`, `pacman`, `uname`, `uptime`, `free`, `df`,
`sensors`, `ip`, `systemctl` and `wallpaper`/`swww`. Your dotfiles are real
files: `cat ~/.config/hypr/hyprland.conf`.

## Quality

- **392 tests** across 48 files; lint is clean (0 errors, 0 warnings).
- The tiling engine and the WM reducer are pure and exhaustively tested — pane
  geometry is verified never to overlap and to keep exact gaps for any window
  count, and the five-window cascade is pinned to geometry measured in a real
  browser.
- An adversarial review pass fixed eight real defects, including tree corruption
  when swapping across workspaces, app state being destroyed on workspace
  switch, and a global key listener re-attaching on every pointer move.

See [design-parity.md](design-parity.md) for the spec-to-implementation map.
