# Design Parity — Terminal Desktop handoff

Maps every section of the `design_handoff_terminal_desktop` spec to what shipped, and records
where the implementation deliberately diverges.

Legend: ✅ implemented · 🔁 implemented differently (with reason) · ➕ added beyond the spec

---

## Layout & stacking

| Spec layer | z-index | Status |
|---|---|---|
| Desktop ground gradient | 0 | ✅ `App.module.css .ground` — palette-tinted so it follows the active theme |
| Neural-network canvas | 1 | ✅ `shell/NeuralCanvas.jsx` |
| Launcher icons | 10 | ✅ `shell/LauncherColumn.jsx` |
| Empty-desktop hint | 20 | ✅ `shell/EmptyHint.jsx` |
| Overview backdrop | 50 | ✅ `shell/Overview.jsx` |
| Tiled windows | 100 / 120 | ✅ `wm/WindowFrame.jsx` |
| Swap-target highlight | 118 | ✅ `wm/TilingOverlays.jsx` |
| Divider hit-areas | 130 | ✅ 12px strips over the 8px gaps |
| Overview windows | 200+ | ✅ |
| Drag ghost | 9500 | ✅ |
| Top bar | 9000 | ✅ `shell/TopBar.jsx` |
| Dock | 8000 | ✅ `shell/Dock.jsx` |

## Window manager

| Behaviour | Status |
|---|---|
| BSP tree, leaf `{id}` / split `{sid,dir,ratio,children}` | ✅ `layout/bsp.js` |
| Tiling area `{12, 40+12, w-24, h-40-24}`, 8px gap | ✅ `tilingArea()` |
| Insert splits the focused leaf, dir from rect aspect, ratio 0.5 | ✅ |
| Close collapses the parent into the sibling | ✅ |
| Minimize leaves the tree, stays in the dock | ✅ |
| Divider drag sets ratio, clamped 0.12–0.88 | ✅ |
| Title-bar drag swaps two leaves, with ghost + highlight | ✅ |
| Floating mode: drag to move, corner grip to resize | ✅ |
| dwindle→float seeds float rects from tiled rects | ✅ |
| float→dwindle rebuilds by inserting into the biggest pane | ✅ |
| Layout transition disabled mid-gesture | ✅ `animated` flag |
| 🔁 Workspaces | Spec calls them cosmetic; here each of the 5 workspaces owns its **own BSP tree**, which is how a real compositor behaves |
| ➕ Keyboard resize | Dividers are focusable and arrow-key operable |
| ➕ Move window to workspace | `Super+Shift+1..5` |

## Shell

| Component | Status |
|---|---|
| Top bar: workspace pills, ⊞ overview, layout toggle, clock, stat pills, power | ✅ |
| Dock: pill per window incl. minimized, click to focus/restore | ✅ |
| Empty hint pill | ✅ |
| Overview: `cols = ceil(sqrt(n))`, cell math, `scale * 0.94`, Esc/backdrop to exit | ✅ `shell/overviewGrid.js` (pure + unit-tested) |
| Launcher column: 6 entries, 44×44 tiles | ✅ |
| ➕ wofi search launcher | `Super+D` fuzzy search over every app |
| ➕ Notifications | mako-style toasts |
| ➕ Boot sequence | BIOS → systemd → SDDM before the desktop |

## Windows & content

| App | Status |
|---|---|
| terminal `raza@arch: ~` | 🔁 The spec's terminal is a static neofetch card. Here the card is the **landing view of a real interactive shell** — strictly more capable, and it still opens on the neofetch look |
| about.md · projects · files · code · browser · power | ✅ `src/apps/*` |
| Window chrome: 11px radius, glass + `saturate(1.3)`, 34px title bar, 9px colour dot, focus ring | ✅ |
| Terminal windows more transparent than others | ✅ `--hypr-glass-terminal` |
| `winIn 0.16s` spawn, 0.5 opacity while dragging | ✅ |

## Interactions

| Bind | Status |
|---|---|
| `Ctrl+Q` — overview→terminal, else overview when a terminal + 2 windows, else new terminal | ✅ |
| `Ctrl+\`` toggle overview · `Esc` exit | ✅ |
| Multi-instance terminals (`term1`, `term2`, …) | ✅ |
| ➕ Super binds | launcher, close, float, focus cycle, workspaces, power, cheatsheet |

## Tokens

Colors, glass surfaces, radii, gaps, bar heights and the easing curves are all in
`theme/tokens.css` + `theme/themes.js`.

🔁 **The spec hard-codes Tokyo Night hex values; here every surface reads a CSS custom property
with the spec hex as the fallback.** That keeps the design pixel-accurate on load while letting all
seven palettes re-skin the entire desktop at runtime.

## Deliberate divergences, summarised

1. **Interactive terminal** instead of a static neofetch card — the shell is the portfolio's best
   feature and the neofetch look is preserved as its landing view.
2. **Per-workspace tiling trees** instead of cosmetic workspaces — more faithful to Hyprland.
3. **Themeable tokens** instead of hard-coded hex — the design's Tokyo Night is the default.
4. **Wallpapers** — the spec has no wallpaper layer; twenty bundled SVG rices sit under the ground
   gradient, switchable from Settings or `wallpaper <name>`.
5. **Existing portfolio apps retained** (Settings, Calculator, Clocks, games…) behind the search
   launcher rather than deleted.
