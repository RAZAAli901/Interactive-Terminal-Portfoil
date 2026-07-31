import { useState, useEffect, useMemo, useRef, Suspense, lazy } from 'react';
import { useHyprland } from './wm/useHyprland';
import { useKeybindings } from './wm/useKeybindings';
import { dwindle, workspaceArea } from './layout/dwindle';
import ErrorBoundary from './components/ErrorBoundary';
import Terminal from "./components/Terminal";
import BootSequence from "./boot/BootSequence";
import WindowFrame from "./wm/WindowFrame";
import DesktopIcon from "./components/DesktopIcon";
import Waybar from "./shell/Waybar";
import Launcher from "./shell/Launcher";
import PowerMenu from "./shell/PowerMenu";
import KeybindCheatsheet from "./shell/KeybindCheatsheet";
import MobileBar from "./shell/MobileBar";
import Notifications from "./shell/Notifications";
import { useNotifications } from "./shell/useNotifications";
import { APPS } from "./config/apps";
const ExplorerWindow = lazy(() => import("./components/ExplorerWindow"));
const Notepad = lazy(() => import("./components/Notepad"));

// New dynamic apps
const Calculator = lazy(() => import("./components/Calculator"));
const Clock = lazy(() => import("./components/Clock"));
const Settings = lazy(() => import("./components/Settings"));
const Browser = lazy(() => import("./components/Browser"));
const Chat = lazy(() => import("./components/Chat"));
const Photos = lazy(() => import("./components/Photos"));
const Solitaire = lazy(() => import("./components/Solitaire"));
const OfficeApp = lazy(() => import("./components/OfficeApp"));
const Store = lazy(() => import("./components/Store"));
const SnippingTool = lazy(() => import("./components/SnippingTool"));
const Vscode = lazy(() => import("./components/Vscode"));
const Minesweeper = lazy(() => import("./components/Minesweeper"));
import { useTheme } from './theme/themeContext';

import styles from './App.module.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [wallpaper, setWallpaper] = useState(4); // Default wallpaper ID
  const { setTheme, theme } = useTheme(); // Hyprland palette switcher (drives root CSS vars)

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dynamic installation state for Store apps
  const [installedApps, setInstalledApps] = useState({
    vscode: false,
    minesweeper: false
  });

  // Dynamic window list
  const initialWindows = {
    terminal: { id: 'terminal', title: 'kitty', icon: '💻', isOpen: true, isMinimized: false, zIndex: 10, defaultWidth: 800, defaultHeight: 500, offsetX: 0, offsetY: 0 },
    explorer: { id: 'explorer', title: 'Files', icon: '📁', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 800, defaultHeight: 500 },
    notepad: { id: 'notepad', title: 'Text Editor', icon: '📝', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 650, defaultHeight: 500, offsetX: 80, offsetY: 40 },
    chat: { id: 'chat', title: 'Discord', icon: '💬', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 700, defaultHeight: 500 },
    browser: { id: 'browser', title: 'Firefox', icon: '🦊', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 900, defaultHeight: 600 },
    settings: { id: 'settings', title: 'Settings', icon: '⚙️', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 750, defaultHeight: 500 },
    calculator: { id: 'calculator', title: 'Calculator', icon: '🧮', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 320, defaultHeight: 480 },
    clock: { id: 'clock', title: 'Clocks', icon: '⏰', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 450, defaultHeight: 400 },
    store: { id: 'store', title: 'Microsoft Store', icon: '🛍️', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 900, defaultHeight: 600 },
    photos: { id: 'photos', title: 'Image Viewer', icon: '🖼️', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 700, defaultHeight: 500 },
    solitaire: { id: 'solitaire', title: 'AisleRiot Solitaire', icon: '🃏', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 700, defaultHeight: 550 },
    word: { id: 'word', title: 'Word - Document1.docx', icon: '📝', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 750, defaultHeight: 550 },
    excel: { id: 'excel', title: 'Excel - Book1.xlsx', icon: '📊', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 800, defaultHeight: 500 },
    powerpoint: { id: 'powerpoint', title: 'PowerPoint - Presentation1.pptx', icon: '🔴', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 800, defaultHeight: 550 },
    outlook: { id: 'outlook', title: 'Outlook', icon: '📧', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 850, defaultHeight: 550 },
    snipping: { id: 'snipping', title: 'Snipping Tool', icon: '✂️', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 600, defaultHeight: 450 },
    onenote: { id: 'onenote', title: 'OneNote', icon: '📓', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 750, defaultHeight: 500 },
    vscode: { id: 'vscode', title: 'Visual Studio Code', icon: '💙', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 900, defaultHeight: 600 },
    minesweeper: { id: 'minesweeper', title: 'Mines', icon: '💣', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 400, defaultHeight: 500 }
  };
  const {
    windows, activeId, activeWorkspace,
    openWindow, closeWindow, focusWindow, toggleFloating,
    switchWorkspace, moveToWorkspace, cycleFocus,
  } = useHyprland(initialWindows);

  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isPowerOpen, setIsPowerOpen] = useState(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [fullscreenId, setFullscreenId] = useState(null);
  const [flashing, setFlashing] = useState(false);
  const [showStartup, setShowStartup] = useState(false);
  const [viewport, setViewport] = useState({ w: 1280, h: 720 });

  const { items: notifications, notify, dismiss } = useNotifications();

  // Called when the SDDM login completes — reveal the desktop with a short fade.
  const handleLogin = () => {
    setIsLoading(false);
    setShowStartup(true);
    setTimeout(() => setShowStartup(false), 700);
    setTimeout(() => notify('Welcome to Hyprland', 'Logged in as razaali@arch', '🎉'), 900);
    setTimeout(() => notify('Tip', 'Press Super+D to open the launcher, Super+/ for keybinds', '💡'), 3200);
  };

  // Toast whenever the colorscheme changes (skips the initial render).
  const firstThemeRun = useRef(true);
  useEffect(() => {
    if (firstThemeRun.current) { firstThemeRun.current = false; return; }
    notify('Theme changed', theme.label, '🎨');
  }, [theme.label, notify]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [terminalInitialCommand, setTerminalInitialCommand] = useState(null);

  // Launch a registry app by id, resolving to its underlying window id.
  const launchApp = (id) => openWindow(APPS[id]?.legacyId || id);

  const handlePower = (action) => {
    setIsPowerOpen(false);
    // Phase 4 wires these to the real boot/login/lock screens; for now reboot,
    // shutdown and logout all restart the session.
    if (action === 'reboot' || action === 'shutdown' || action === 'logout') {
      window.location.reload();
    }
  };

  // Hyprland-style Super-key shortcuts.
  useKeybindings(
    {
      launcher: () => setIsLauncherOpen((o) => !o),
      terminal: () => openWindow('terminal'),
      closeActive: () => {
        if (!activeId) return;
        closeWindow(activeId);
        setFullscreenId((id) => (id === activeId ? null : id));
      },
      toggleFloat: () => activeId && toggleFloating(activeId),
      focusNext: () => cycleFocus(1),
      focusPrev: () => cycleFocus(-1),
      fullscreen: () => activeId && setFullscreenId((id) => (id === activeId ? null : activeId)),
      screenshot: () => {
        setFlashing(true);
        setTimeout(() => setFlashing(false), 260);
        notify('Screenshot saved', '~/Pictures/screenshot.png', '📸');
      },
      workspace: (n) => switchWorkspace(n),
      workspacePrev: () => switchWorkspace(Math.max(1, activeWorkspace - 1)),
      workspaceNext: () => switchWorkspace(Math.min(5, activeWorkspace + 1)),
      moveWorkspace: (n) => moveToWorkspace(activeId, n),
      powerMenu: () => setIsPowerOpen((o) => !o),
      cheatsheet: () => setIsCheatsheetOpen((o) => !o),
    },
    { enabled: !isLoading && !isMobile },
  );

  // Dwindle layout for tiled windows on the active workspace.
  const rectById = useMemo(() => {
    const tiledWins = Object.values(windows).filter(
      (w) => w.isOpen && !w.isMinimized && !w.floating && w.workspace === activeWorkspace,
    );
    const rects = dwindle(workspaceArea(viewport.w, viewport.h), tiledWins.length);
    const map = {};
    tiledWins.forEach((w, i) => { map[w.id] = rects[i]; });
    return map;
  }, [windows, activeWorkspace, viewport]);

  // Re-trigger the workspace slide animation on each switch (no remount).
  const layerRef = useRef(null);
  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;
    el.classList.remove(styles.wsSlide);
    void el.offsetWidth; // force reflow so the animation restarts
    el.classList.add(styles.wsSlide);
  }, [activeWorkspace]);

  const wallpapers = {
    1: 'https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?q=80&w=2073&auto=format&fit=crop',
    2: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2070&auto=format&fit=crop',
    3: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop',
    4: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=2070&auto=format&fit=crop',
    5: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop',
    6: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2070&auto=format&fit=crop',
    7: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
    8: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    9: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
    10: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop',
    11: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop',
    12: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop',
  };

  const openTerminalWithCommand = (cmd) => {
    setTerminalInitialCommand(cmd);
    openWindow('terminal');
  };

  const handleDesktopClick = () => {
    if (contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    });
  };

  // Render individual application content
  const renderWindowContent = (id) => {
    switch (id) {
      case 'terminal':
        return <Terminal setTheme={setTheme} setWallpaper={setWallpaper} initialCommand={terminalInitialCommand} setInitialCommand={setTerminalInitialCommand} />;
      case 'explorer':
        return <ExplorerWindow />;
      case 'notepad':
        return <Notepad />;
      case 'chat':
        return <Chat />;
      case 'browser':
        return <Browser />;
      case 'settings':
        return <Settings setWallpaper={setWallpaper} currentWallpaper={wallpaper} />;
      case 'calculator':
        return <Calculator />;
      case 'clock':
        return <Clock />;
      case 'store':
        return (
          <Store 
            installedApps={installedApps} 
            onInstallApp={(appId) => setInstalledApps(prev => ({ ...prev, [appId]: true }))} 
            onOpenApp={openWindow}
          />
        );
      case 'photos':
        return <Photos />;
      case 'solitaire':
        return <Solitaire />;
      case 'word':
      case 'excel':
      case 'powerpoint':
      case 'outlook':
      case 'onenote':
        return <OfficeApp appType={id} />;
      case 'vscode':
        return <Vscode />;
      case 'minesweeper':
        return <Minesweeper />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`${styles.desktop} ${isMobile ? 'mobile-terminal-active' : ''}`}
      style={{ backgroundImage: `url(${wallpapers[wallpaper]})` }}
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      <div className={styles.desktopOverlay}></div>
      {showStartup && <div className={styles.startupFade} />}
      {flashing && <div className={styles.screenFlash} />}
      {isLoading ? (
        <BootSequence wallpaper={wallpapers[wallpaper]} onComplete={handleLogin} />
      ) : isMobile ? (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--terminal-bg)', overflow: 'hidden' }}>
          <MobileBar />
          <div style={{ flex: 1, minHeight: 0 }}>
            <Terminal setTheme={setTheme} setWallpaper={setWallpaper} />
          </div>
        </div>
      ) : (
        <>
          <div className={styles.desktopIcons}>
            <DesktopIcon label="kitty" icon="💻" onDoubleClick={() => openWindow('terminal')} />
            <DesktopIcon label="Files" icon="📁" onDoubleClick={() => openWindow('explorer')} />
            <DesktopIcon label="Firefox" icon="🦊" onDoubleClick={() => openWindow('browser')} />
            <DesktopIcon label="Code" icon="💙" onDoubleClick={() => openWindow('vscode')} />
          </div>

          <div className={styles.wsLayer} ref={layerRef}>
            {Object.values(windows).map(win => {
              if (!win.isOpen) return null;
              return (
                <ErrorBoundary key={win.id}>
                  <WindowFrame
                    title={win.title}
                    icon={win.icon}
                    isActive={win.id === activeId}
                    tiled={!win.floating}
                    rect={rectById[win.id]}
                    hidden={win.workspace !== activeWorkspace}
                    fullscreen={win.id === fullscreenId}
                    onClose={() => closeWindow(win.id)}
                    onToggleFloating={() => toggleFloating(win.id)}
                    isMinimized={win.isMinimized}
                    defaultWidth={win.defaultWidth}
                    defaultHeight={win.defaultHeight}
                    offsetX={win.offsetX}
                    offsetY={win.offsetY}
                    zIndex={win.zIndex}
                    onFocus={() => focusWindow(win.id)}
                  >
                    <Suspense fallback={<div style={{ padding: '20px', color: 'var(--terminal-text)' }}>Loading app...</div>}>
                      {renderWindowContent(win.id)}
                    </Suspense>
                  </WindowFrame>
                </ErrorBoundary>
              );
            })}
          </div>

          <Waybar
            activeWorkspace={activeWorkspace}
            occupied={new Set(Object.values(windows).filter((w) => w.isOpen).map((w) => w.workspace))}
            onWorkspace={switchWorkspace}
            focusedTitle={windows[activeId]?.title || ''}
            onLauncher={() => setIsLauncherOpen((o) => !o)}
            onPower={() => setIsPowerOpen(true)}
          />

          <Launcher
            isOpen={isLauncherOpen}
            onLaunch={launchApp}
            onClose={() => setIsLauncherOpen(false)}
          />

          <PowerMenu
            isOpen={isPowerOpen}
            onClose={() => setIsPowerOpen(false)}
            onAction={handlePower}
          />

          <KeybindCheatsheet
            isOpen={isCheatsheetOpen}
            onClose={() => setIsCheatsheetOpen(false)}
          />

          <Notifications items={notifications} onDismiss={dismiss} />

          {contextMenu.visible && (
            <div 
              className={styles.contextMenu}
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <div className={styles.contextMenuItem} onClick={() => setWallpaper((prev) => (prev % 12) + 1)}>
                Change Wallpaper
              </div>
              <div className={styles.contextMenuItem} onClick={() => openWindow('terminal')}>
                Open Terminal
              </div>
              <div className={styles.contextMenuItem} onClick={() => openTerminalWithCommand('about')}>
                About
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
