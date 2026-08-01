# Arch Linux + Hyprland Portfolio

<p align="center">
  <a href="https://razaali901.github.io/Interactive-Terminal-Portfoil/" target="_blank">
    <img src="https://img.shields.io/badge/LAUNCH_PORTFOLIO-Arch_%2B_Hyprland-7aa2f7?style=for-the-badge&logo=archlinux&logoColor=white" height="45">
  </a>
</p>

<p align="center">
  <i>A Tokyo Night Linux rice, rebuilt in the browser — BSP dwindle tiling, a waybar, a wofi
  launcher, a hyprexpo window overview, an animated neural-network wallpaper, and a real
  interactive kitty shell.</i>
</p>

---

## 📸 Screenshots
*(Add screenshots here)*
- `Boot` — fake BIOS/POST → systemd log → SDDM login.
- `Desktop` — dwindle-tiled glass windows over the neural-network canvas.
- `Overview` — every window scaled into a grid (`Ctrl+\``).
- `Terminal` — kitty with the neofetch landing card.

## ✨ Features

### Window manager
- **BSP dwindle tiling** — a real binary-space-partition tree, not a fixed grid. Each new window
  splits the focused pane along its longer axis, producing the classic dwindle cascade.
- **Drag a gap to resize** — every split renders a 12px grab strip; dragging live-updates that
  node's ratio (clamped 0.12–0.88).
- **Drag a title bar to swap** — a ghost chip follows the cursor and the pane underneath is
  outlined; releasing exchanges the two windows in the tree.
- **Floating mode** — toggle to free-drag and corner-resize windows; switching back re-tiles them.
- **Five workspaces**, each with its own independent tree.
- **Window overview** (hyprexpo) — every window scaled into a grid, click to focus.

### Desktop shell
- **Top bar** — workspace pills, overview button, layout toggle, clock, and live CPU / RAM / temp /
  network / volume / battery pills.
- **Dock** — a pill per open window, including minimized ones.
- **Launcher column** + a **wofi-style fuzzy search launcher** (`Super+D`).
- **Neural-network wallpaper** — a DPR-aware canvas of drifting nodes linked by accent-coloured
  edges, driven by `requestAnimationFrame`.
- **20 bundled wallpapers** — original SVG rice art across Tokyo Night, Catppuccin, Gruvbox, Nord,
  Everforest, Rosé Pine, Dracula and minimal/terminal styles.
- **7 runtime colorschemes** — switch live with `theme <name>` or from Settings.

### Apps
`kitty` (interactive shell) · `Files` · `Firefox` (renders the real GitHub repos) · `Code`
(VS Code look) · `about.md` · `projects` · plus Settings, Calculator, Clocks, Image Viewer,
Discord and games behind the search launcher.

### Terminal
A real command shell — auto-complete, history, an AI/RAG query parser, live GitHub API stats, and
a simulated filesystem — including your real dotfiles at `~/.config/hypr/hyprland.conf`.

Linux commands: `fastfetch` · `hyprctl` (version/monitors/workspaces/clients/activewindow/getoption)
· `btop` · `htop` · `cava` · `pacman` · `uname` · `uptime` · `free` · `df` · `sensors` · `ip`
· `systemctl` · `wallpaper`/`swww` · `theme`.

## ⌨️ Keybindings

| Keys | Action |
| :--- | :--- |
| `Ctrl + Q` | New terminal — becomes the overview once you have windows tiled |
| `Ctrl + \`` | Toggle window overview |
| `Esc` | Exit overview |
| `Super + D` | Open the search launcher |
| `Super + Return` | Open a terminal |
| `Super + Q` | Close the focused window |
| `Super + J` / `K` | Cycle window focus |
| `Super + Space` | Toggle dwindle / floating |
| `Super + 1…5` | Switch workspace |
| `Super + Shift + 1…5` | Move window to workspace |
| `Super + H` / `L` | Previous / next workspace |
| `Super + Esc` | Power menu |
| `Super + /` | Keybind cheatsheet |

> `Super` is the `⌘` / Windows key (Alt works as a fallback).
> **Mouse:** drag a gap to resize · drag a title bar to swap two windows.

## 🛠️ Technology Stack

- **Core**: React 19, JavaScript (ES6+), CSS Modules
- **Build**: Vite (rolldown), Tailwind CSS 4
- **Testing**: Vitest, React Testing Library
- **Type**: JetBrains Mono + Inter
- **Deployment**: GitHub Pages / Vercel

## 🚀 Quick Setup

```bash
git clone https://github.com/RAZAAli901/Interactive-Terminal-Portfoil.git
cd Interactive-Terminal-Portfoil
npm install
npm run dev      # start dev server
npm run build    # production build
npm run test     # run the test suite
```

## 🧱 Architecture

```
src/
  layout/bsp.js      pure BSP tiling engine (split, insert, remove, swap, layout)
  wm/                wmReducer (per-workspace trees) · useRiceWM (gestures) · WindowFrame
  shell/             TopBar · Dock · Overview · LauncherColumn · Launcher · NeuralCanvas
  apps/              Neofetch · About · Projects · Files · Code · Browser · Power
  boot/  login/      BIOS → systemd → SDDM
  theme/             7 palettes, design tokens, low-power mode
  data/              projects, wallpapers manifest
```

The tiling engine and the reducer are pure and fully unit-tested — the geometry is verified to
never overlap and to keep exact gaps for any window count.

## 📚 Docs

- [Rice release notes](docs/rice-release-notes.md) — a guided tour of what to try first.
- [Design parity](docs/design-parity.md) — the handoff spec mapped to the implementation.
- [Revamp plan](docs/hyprland-revamp-plan.md) — how the desktop got here.

## 🤝 Contributing

Contributions, issues and feature requests are welcome — see the
[issues page](https://github.com/RAZAAli901/Interactive-Terminal-Portfoil/issues).

## 📝 License

Open-source under the [MIT License](LICENSE). The bundled wallpapers are original artwork created
for this project.
