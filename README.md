# Arch Linux + Hyprland Portfolio

<p align="center">
  <a href="https://razaali901.github.io/Interactive-Terminal-Portfoil/" target="_blank">
    <img src="https://img.shields.io/badge/LAUNCH_PORTFOLIO-Arch_%2B_Hyprland-cba6f7?style=for-the-badge&logo=archlinux&logoColor=white" height="45">
  </a>
</p>

<p align="center">
  <i>A ricer-grade Arch Linux + Hyprland desktop, recreated in the browser — dwindle tiling, waybar, wofi launcher, a full boot sequence, and a kitty terminal shell.</i>
</p>

---

## 📸 Screenshots
*(Add screenshots here)*
- `Boot` — fake BIOS/POST → systemd log → SDDM login.
- `Desktop` — Catppuccin desktop with waybar, dwindle-tiled windows and animated gradient borders.
- `Launcher` — wofi-style fuzzy app launcher (`Super+D`).
- `Terminal` — kitty running a fastfetch landing card.

## ✨ Features

- **Full boot experience**: fake BIOS/POST, streaming systemd `[ OK ]` log, and an SDDM-style login before the Hyprland startup fade. Every stage is skippable.
- **Hyprland window manager**: dwindle **tiling** across **5 workspaces**, a **floating** toggle, animated **gradient focus borders**, blur, gaps, rounded corners, and scale/fade **spawn animations**.
- **Waybar**: Arch launcher, workspace pills, focused-window title, live CPU/RAM/temp/network telemetry, clock and power menu.
- **Wofi launcher**: fuzzy-searchable app grid (`Super+D`).
- **Super-key bindings**: `Super+D` launcher · `Super+Return` terminal · `Super+Q` close · `Super+Space` float · `Super+1-5` workspace · `Super+Shift+1-5` move · `Super+Esc` power · `Super+/` cheatsheet.
- **Runtime theming**: Catppuccin Mocha/Latte, Tokyo Night, Gruvbox, Nord and Dracula — switch live with `theme <name>`.
- **kitty terminal**: full command shell with auto-complete, history, a `fastfetch` profile card, an AI/RAG query parser, and live GitHub API stats.
- **Curated Linux apps**: Files (thunar), Firefox, VS Code, Image Viewer, Settings, Calculator, Clocks, plus games behind the launcher.
- **Responsive & accessible**: focused terminal experience on mobile, `prefers-reduced-motion` support, and full keyboard operation.

## 🛠️ Technology Stack

- **Core**: React 19, JavaScript (ES6+), CSS Modules
- **Animation**: anime.js (draggable + physics), CSS keyframes with Hyprland easing curves
- **Build**: Vite (rolldown), Tailwind CSS 4
- **Testing**: Vitest, React Testing Library
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

## ⌨️ Keybindings

| Keys | Action |
| :--- | :--- |
| `Super + D` | Open the app launcher |
| `Super + Return` | Open a terminal |
| `Super + Q` | Close the focused window |
| `Super + Space` | Toggle floating / tiled |
| `Super + 1…5` | Switch workspace |
| `Super + Shift + 1…5` | Move window to workspace |
| `Super + Esc` | Power menu |
| `Super + /` | Keybind cheatsheet |

> `Super` is the `⌘` / Windows key (Alt also works as a fallback).

## 🖥️ Terminal Commands

| Command | Description |
| :--- | :--- |
| `fastfetch` | Arch-logo system-info card (aka `neofetch`) |
| `about` | Info about the developer |
| `projects` | View portfolio projects |
| `skills` | ASCII bar chart of core skills |
| `theme [name]` | Switch palette (`catppuccin-mocha`, `tokyo-night`, `gruvbox`, `nord`, `dracula`, …) |
| `wallpaper [1-12]` | Change the desktop background |
| `ask [query]` | Query the integrated AI assistant |
| `github` | Fetch live repository stats over the GitHub API |
| `sudo` | Elevate session to admin mode |
| `clear` | Clear the terminal screen |

## 🤝 Contributing

Contributions, issues, and feature requests are welcome — see the [issues page](https://github.com/RAZAAli901/Interactive-Terminal-Portfoil/issues).

## 📝 License

Open-source under the [MIT License](LICENSE).
