# Hyprland Revamp — Engineering Plan

Turn the Windows-desktop portfolio into an **Arch Linux + Hyprland** ricer experience:
smooth spawn/close animations, rounded corners, blur, gaps, animated gradient borders,
waybar, wofi launcher, tiling + floating windows, full boot → login → desktop sequence.

---

## 1. Decisions (locked)

| Area | Decision |
|------|----------|
| Window model | **Hybrid** — dwindle auto-tiling by default, floating toggle (keeps drag + resize) |
| Colorscheme | **Catppuccin Mocha** default; `theme <name>` command swaps full palette at runtime |
| Boot flow | **Full** — fake BIOS/POST → systemd boot log → SDDM login → Hyprland startup fade |
| App scope | **Curate** to Linux-authentic set; Windows-only apps dropped or moved behind launcher |

---

## 2. Current architecture (baseline)

- **Stack:** React 19 · Vite (rolldown) · Tailwind 4 · anime.js 4.5 · CSS Modules + global `index.css` CSS-variable theming.
- **Shell:** `LoadingScreen` (Win boot) → desktop wallpaper + `DesktopIcon`s → floating `Window` frames → `Taskbar` + `StartMenu` + context menu.
- **State:** `useWindowManager` (open/close/minimize/maximize/focus, zIndex). anime.js `createDraggable` owns window transform/position.
- **Apps (~18, lazy):** Terminal (core: commandHandler, aiParser, githubApi, fileSystem sim), Explorer, Notepad, Calculator, Clock, Settings, Browser, Chat, Photos, Solitaire, Office ×5, Store, Snipping, VSCode, Minesweeper, DinoGame, MatrixScreensaver.
- **Mobile:** fullscreen Terminal only.
- **Data:** `portfolio.json`, `easterEggs.js`, `funFacts.js`. **Deploy:** GitHub Pages + Vercel.

**Reused as-is:** all terminal `utils/*` (commandHandler, aiParser, githubApi, fuzzyMatch, fileSystem, formatting), `data/*`, theme CSS-variable pattern, anime.js draggable.

---

## 3. Target experience

### 3.1 Boot sequence (replaces `LoadingScreen`)
1. **BIOS/POST** — black screen, motherboard text, memory check, "Booting from disk…". ~1.2s, skippable (any key).
2. **systemd boot log** — Arch, scrolling `[ OK ]` (green) service lines in TTY font. ~1.5s, skippable.
3. **SDDM login** — blurred wallpaper, big clock/date, user avatar `razaali`, password field. Enter/click = authenticate → fade.
4. **Hyprland startup** — fade from black, wallpaper fades in, waybar slides down, first window (terminal + fastfetch) pops in with Hyprland spawn animation.

All skippable; a `?skipBoot=1` / localStorage flag lets return visitors jump to desktop.

### 3.2 Desktop shell
- **Wallpaper** (swww-style) — Catppuccin ricer wallpapers; keep runtime switching (`wallpaper` cmd + Settings).
- **Waybar** (top bar, replaces `Taskbar`): left = workspace pills (1–5, occupied/active states) + focused-window title; right = system modules (CPU/RAM/net — animated fake telemetry), volume, battery, tray, clock/date, power button. Rounded Catppuccin pill segments.
- **Wofi launcher** (replaces `StartMenu`): centered fuzzy-search app grid, opens on `Super+D` or waybar icon. Reuses `utils/fuzzyMatch`.
- **Power menu**: lock / logout / reboot / shutdown (wlogout-style ring of buttons) — reboot/shutdown replay boot sequence.
- **Window chrome**: **no Windows titlebar**. Hyprland look = rounded corners, gaps, blur behind (`backdrop-filter`), animated **conic-gradient focus border**, drop shadow. Minimal control affordances (close via `Super+Q` / launcher; small controls on hover for mouse users).

### 3.3 Window manager (v2)
- **Dwindle tiling engine** (`layout/dwindle.js`): binary-split rectangles filling workspace minus gaps + waybar. New window splits focused window's region (alternating h/v by aspect ratio).
- **Floating toggle** (`Super+Space` / hover control): floating windows regain anime.js drag + corner resize; stack by zIndex.
- **Workspaces**: 5 virtual; `Super+1..5` switch with slide animation; windows bound to a workspace; waybar reflects occupancy.
- **Animations** (anime.js, Hyprland-matched beziers): spawn = scale 0.85→1 + fade + slight overshoot (`cubic-bezier(0.05,0.9,0.1,1.05)`); close = scale down + fade; workspace = horizontal slide; tiling reflow = eased position/size tween.
- **Keybindings** (`useKeybindings`): `Super+D` launcher · `Super+Q` close · `Super+Space` float · `Super+Enter` terminal · `Super+1..5` workspace · `Super+J/K` focus cycle · `Super+F` fullscreen. Cheap authenticity win; discoverable via a keybind cheatsheet (`Super+?`).

### 3.4 App curation (Windows → Linux)
| Keep / reskin | Linux identity | Source |
|---|---|---|
| Terminal (**hero**) | kitty + **fastfetch** landing (Arch ASCII + portfolio "sysinfo") | `Terminal.jsx` + new fastfetch cmd |
| Files | Thunar / nautilus | `ExplorerWindow.jsx` |
| Code | VS Code / neovim | `Vscode.jsx` |
| Browser | Firefox | `Browser.jsx` |
| Images | imv / mpv | `Photos.jsx` |
| Settings | nwg-look / hypr settings (theme, wallpaper, animation toggles) | `Settings.jsx` (extend) |
| Calculator, Clock | gnome-calculator, gnome-clocks (floating utils, tiling demo) | keep |
| Chat *(optional)* | Discord/telegram client | `Chat.jsx` |

**New (cheap ricer wins):** `fastfetch` (terminal), optional `btop` (system monitor TUI) and `cava` (audio bars) as terminal-launched apps.

**Dropped from default / moved to launcher "Games" or "Legacy" category (not deleted):** Office ×5, Solitaire, Minesweeper, MS Store, Snipping Tool. DinoGame + MatrixScreensaver repurposed (Matrix → screensaver/idle + hyprlock backdrop).

### 3.5 Theming (command-switchable)
- Extract palettes into `theme/themes.js`: **Catppuccin Mocha** (default), Latte, Tokyo Night, Gruvbox, Nord, Dracula.
- `ThemeProvider` sets all palette vars on `:root`; **every** surface (waybar, borders, launcher, windows, terminal) reads vars — not just terminal.
- `theme <name>` terminal command + Settings dropdown both drive it. `wallpaper` command retained.

---

## 4. New / changed file structure

```
src/
  boot/            BiosScreen.jsx  SystemdBoot.jsx           (new)
  login/           SddmLogin.jsx                             (new)
  shell/           HyprStartup.jsx  Waybar.jsx  Launcher.jsx  PowerMenu.jsx  KeybindCheatsheet.jsx  (new)
  wm/              WindowFrame.jsx (v2 chrome)  useHyprland.js  useKeybindings.js  (new; supersedes useWindowManager)
  layout/          dwindle.js                                (new)
  theme/           themes.js  ThemeProvider.jsx              (new)
  apps/            (renamed/curated from components/*: Terminal, Files, Code, Firefox, Images, Settings, Calculator, Clock)
  components/      (shared: WindowFrame, Icon, etc.)
  utils/ data/ hooks/  (largely unchanged)
docs/hyprland-revamp-plan.md
```

Old `Taskbar`, `StartMenu`, `LoadingScreen`, `DesktopIcon`, Windows `Window` chrome retired (kept in git history).

---

## 5. Phasing (each phase stays deployable)

- **Phase 0 — Foundation:** `theme/` palettes + `ThemeProvider`; Catppuccin base tokens; new folder scaffold; app registry with `category` + `enabled` flags (curate without deleting). No visual regression to terminal. *Gate: build + lint + existing tests green.*
- **Phase 1 — Window v2:** rounded corners, gaps, blur, animated gradient focus border, spawn/close animations. Still floating. Retire Windows titlebar chrome.
- **Phase 2 — Desktop shell:** Waybar (replaces Taskbar), Wofi launcher (replaces StartMenu), keybindings, power menu, fastfetch landing in terminal.
- **Phase 3 — Tiling + workspaces:** `dwindle.js` engine, 5 workspaces + slide animation, floating toggle, reflow tweens, focus cycle.
- **Phase 4 — Boot/login:** BIOS → systemd → SDDM → Hypr startup, replacing LoadingScreen; skip flags.
- **Phase 5 — App curation + reskin:** kitty/thunar/firefox/vscode/images/settings reskins; games/office into launcher category or removed.
- **Phase 6 — Polish:** mobile mode (tiling → single-column/terminal-first + bottom bar), `prefers-reduced-motion`, blur/perf fallbacks, a11y + focus mgmt, update/extend tests, deploy paths verified.

---

## 6. Risks & mitigations

- **Perf** — `backdrop-filter` blur + many animations jank on low-end/mobile → cap blur layers, GPU transforms only, `prefers-reduced-motion`, low-power toggle in Settings.
- **Mobile** — tiling UX doesn't translate → dedicated mobile shell (terminal-first / single-window stack + bottom bar), no free tiling.
- **Scope** — 18 apps → curation shrinks surface; terminal + ~6 apps first-class, rest behind launcher categories.
- **Regression** — keep `aiParser`/`commandHandler`/`fuzzyMatch` tests green; add tests for `dwindle` layout, keybindings, theme provider.
- **A11y** — keyboard-driven aids a11y, but ensure focus management, aria roles on shell surfaces, and full mouse parity.
- **Deploy** — GH Pages + Vercel base paths must keep resolving (asset URLs, wallpapers).

---

## 7. Out of scope (v1)

Real Wayland behavior, multi-monitor, actual IPC, persistent per-visitor window layouts, server-side anything. All simulated client-side.
