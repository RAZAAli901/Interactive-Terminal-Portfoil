import { useCallback, useEffect, useMemo, useState, Suspense, lazy } from 'react';
import { useRiceWM } from './wm/useRiceWM';
import { useKeybindings } from './wm/useKeybindings';
import { overviewLayout } from './shell/overviewGrid';
import { RICE_APPS } from './config/riceApps';
import { DEFAULT_WALLPAPER, getWallpaper, wallpaperUrl } from './data/wallpapers';
import { getPref, setPref } from './utils/prefs';

import ErrorBoundary from './components/ErrorBoundary';
import Terminal from './components/Terminal';
import BootSequence from './boot/BootSequence';
import WindowFrame from './wm/WindowFrame';
import { Dividers, DragGhost, SwapTarget } from './wm/TilingOverlays';

import NeuralCanvas from './shell/NeuralCanvas';
import TopBar from './shell/TopBar';
import Dock from './shell/Dock';
import EmptyHint from './shell/EmptyHint';
import Overview from './shell/Overview';
import LauncherColumn from './shell/LauncherColumn';
import Launcher from './shell/Launcher';
import PowerMenu from './shell/PowerMenu';
import KeybindCheatsheet from './shell/KeybindCheatsheet';
import MobileBar from './shell/MobileBar';
import Notifications from './shell/Notifications';
import { useNotifications } from './shell/useNotifications';
import { useSystemStats } from './shell/useSystemStats';

// Design-handoff apps
const AboutApp = lazy(() => import('./apps/AboutApp'));
const ProjectsApp = lazy(() => import('./apps/ProjectsApp'));
const FilesApp = lazy(() => import('./apps/FilesApp'));
const CodeApp = lazy(() => import('./apps/CodeApp'));
const BrowserApp = lazy(() => import('./apps/BrowserApp'));
const PowerApp = lazy(() => import('./apps/PowerApp'));

// Existing portfolio apps, reachable from the search launcher
const Settings = lazy(() => import('./components/Settings'));
const Notepad = lazy(() => import('./components/Notepad'));
const Photos = lazy(() => import('./components/Photos'));
const Chat = lazy(() => import('./components/Chat'));
const Calculator = lazy(() => import('./components/Calculator'));
const Clock = lazy(() => import('./components/Clock'));
const Solitaire = lazy(() => import('./components/Solitaire'));
const Minesweeper = lazy(() => import('./components/Minesweeper'));

import { useTheme } from './theme/themeContext';
import styles from './App.module.css';

const FALLBACK = <div style={{ padding: 20, color: 'var(--hypr-subtext)' }}>Loading…</div>;

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  // Wallpaper choice survives reloads, like a real desktop.
  const [wallpaper, setWallpaper] = useState(
    () => getWallpaper(getPref('wallpaper', DEFAULT_WALLPAPER)).id,
  );
  const [browserProject, setBrowserProject] = useState(0);
  const [showStartup, setShowStartup] = useState(false);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isPowerOpen, setIsPowerOpen] = useState(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [terminalCommand, setTerminalCommand] = useState(null);

  const { setTheme, theme } = useTheme();
  const stats = useSystemStats();
  const { items: notifications, notify, dismiss } = useNotifications();
  const wm = useRiceWM(RICE_APPS);

  useEffect(() => { setPref('wallpaper', wallpaper); }, [wallpaper]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── launching ────────────────────────────────────────────────────────────
  const launch = useCallback((app) => {
    if (app === 'power') { setIsPowerOpen(true); return; }
    wm.openApp(app);
  }, [wm]);

  /** Open the browser window on a specific repo (from Projects or Files). */
  const openProject = useCallback((index) => {
    setBrowserProject(index);
    wm.openApp('browser');
  }, [wm]);

  // ── keyboard ─────────────────────────────────────────────────────────────
  // Ctrl+Q is the design's primary bind: it spawns terminals, and once you have
  // a terminal plus a second window it doubles as the overview toggle.
  const handleCtrlQ = useCallback(() => {
    if (wm.overview) { wm.setOverview(false); wm.openApp('terminal'); return; }
    const hasTerminal = wm.openIds.some((id) => id.startsWith('term'));
    if (hasTerminal && wm.openIds.length >= 2) { wm.setOverview(true); return; }
    wm.openApp('terminal');
  }, [wm]);

  useEffect(() => {
    if (isLoading || isMobile) return undefined;
    const onKey = (e) => {
      const k = (e.key || '').toLowerCase();
      if (e.ctrlKey && k === 'q') { e.preventDefault(); handleCtrlQ(); }
      else if (e.ctrlKey && (e.code === 'Backquote' || k === '`')) { e.preventDefault(); wm.setOverview((o) => !o); }
      else if (k === 'escape' && wm.overview) { e.preventDefault(); wm.setOverview(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLoading, isMobile, handleCtrlQ, wm]);

  useKeybindings({
    launcher: () => setIsLauncherOpen((o) => !o),
    terminal: () => wm.openApp('terminal'),
    closeActive: () => wm.focusedId && wm.closeWindow(wm.focusedId),
    toggleFloat: () => wm.toggleLayout(),
    minimize: () => wm.focusedId && wm.minimizeWindow(wm.focusedId),
    focusNext: () => wm.cycleFocus(1),
    focusPrev: () => wm.cycleFocus(-1),
    workspace: (n) => wm.switchWorkspace(n),
    workspacePrev: () => wm.switchWorkspace(Math.max(1, wm.activeWorkspace - 1)),
    workspaceNext: () => wm.switchWorkspace(Math.min(5, wm.activeWorkspace + 1)),
    moveWorkspace: (n) => wm.focusedId && wm.moveToWorkspace(wm.focusedId, n),
    fullscreen: () => wm.setOverview((o) => !o),
    powerMenu: () => setIsPowerOpen((o) => !o),
    cheatsheet: () => setIsCheatsheetOpen((o) => !o),
    screenshot: () => notify('Screenshot saved', '~/Pictures/screenshot.png', '📸'),
  }, { enabled: !isLoading && !isMobile });

  // ── boot ─────────────────────────────────────────────────────────────────
  const handleLogin = () => {
    setIsLoading(false);
    setShowStartup(true);
    setTimeout(() => setShowStartup(false), 700);
    setTimeout(() => wm.openApp('terminal'), 260);
    setTimeout(() => notify('Welcome to Hyprland', 'Logged in as raza@arch', '🎉'), 1000);
    setTimeout(() => notify('Tip', 'ctrl+q spawns terminals · ctrl+` for overview', '💡'), 3600);
  };

  const handlePower = (action) => {
    setIsPowerOpen(false);
    if (action === 'lock') return;
    window.location.reload();
  };

  // ── overview geometry ────────────────────────────────────────────────────
  const overviewRects = useMemo(() => {
    if (!wm.overview) return null;
    const items = wm.openIds.map((id) => ({ id, w: wm.geometry[id].w, h: wm.geometry[id].h }));
    const placed = overviewLayout(items, wm.viewport);
    return Object.fromEntries(placed.map((p) => [p.id, p]));
  }, [wm.overview, wm.openIds, wm.geometry, wm.viewport]);

  // ── window content ───────────────────────────────────────────────────────
  const renderContent = (win) => {
    switch (win.app) {
      case 'terminal':
        return (
          <Terminal
            setTheme={setTheme}
            setWallpaper={setWallpaper}
            initialCommand={terminalCommand}
            setInitialCommand={setTerminalCommand}
          />
        );
      case 'about': return <AboutApp />;
      case 'projects': return <ProjectsApp onOpenProject={openProject} />;
      case 'files': return <FilesApp onOpenProject={openProject} />;
      case 'code': return <CodeApp />;
      case 'browser': return <BrowserApp projectIndex={browserProject} />;
      case 'power': return <PowerApp />;
      case 'settings': return <Settings setWallpaper={setWallpaper} currentWallpaper={wallpaper} />;
      case 'editor': return <Notepad />;
      case 'images': return <Photos />;
      case 'chat': return <Chat />;
      case 'calculator': return <Calculator />;
      case 'clock': return <Clock />;
      case 'solitaire': return <Solitaire />;
      case 'minesweeper': return <Minesweeper />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.desktop} style={{ backgroundImage: `url(${wallpaperUrl(wallpaper)})` }}>
        <div className={styles.ground} />
        <BootSequence wallpaper={wallpaperUrl(wallpaper)} onComplete={handleLogin} />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={styles.mobile}>
        <MobileBar />
        <div className={styles.mobileBody}>
          <Terminal setTheme={setTheme} setWallpaper={setWallpaper} />
        </div>
      </div>
    );
  }

  const swapRect = wm.drag.target ? wm.geometry[wm.drag.target] : null;
  const dragWin = wm.drag.id ? wm.windows[wm.drag.id] : null;

  return (
    <div
      className={styles.desktop}
      style={{ backgroundImage: `url(${wallpaperUrl(wallpaper)})` }}
    >
      <div className={styles.ground} />
      <NeuralCanvas accent={theme.role.accent} />
      {showStartup && <div className={styles.startupFade} />}

      <LauncherColumn onLaunch={launch} />
      <EmptyHint visible={wm.openIds.length === 0} />
      <Overview open={wm.overview} count={wm.openIds.length} onExit={() => wm.setOverview(false)} />

      {/* Every non-minimized window stays mounted; off-workspace ones are
          hidden so their app state (terminal scrollback, scroll position,
          half-typed input) survives a workspace switch. */}
      {wm.mountedIds.map((id) => {
        const win = wm.windows[id];
        const onActiveWs = win.ws === wm.activeWorkspace;
        const idx = wm.openIds.indexOf(id);
        const def = RICE_APPS[win.app];
        const rect = wm.geometry[id];
        const ov = overviewRects?.[id];
        return (
          <ErrorBoundary key={id}>
            <WindowFrame
              title={def?.title || win.app}
              color={def?.color}
              rect={rect}
              zIndex={wm.tiling ? (id === wm.focusedId ? 120 : 100) : 100 + win.z}
              isActive={id === wm.focusedId}
              isTerminal={win.app === 'terminal'}
              hidden={!onActiveWs}
              isDragging={wm.drag.id === id}
              animated={wm.animated}
              floating={!wm.tiling && !wm.overview}
              overviewStyle={onActiveWs && ov && {
                left: ov.left, top: ov.top, width: ov.w, height: ov.h,
                transform: `scale(${ov.scale})`, transformOrigin: '0 0',
                zIndex: 200 + idx,
                transition: 'transform 0.3s cubic-bezier(.2,.8,.2,1), left 0.3s cubic-bezier(.2,.8,.2,1), top 0.3s cubic-bezier(.2,.8,.2,1)',
              }}
              onFocus={() => (wm.overview ? (wm.setOverview(false), wm.focusWindow(id)) : wm.focusWindow(id))}
              onClose={() => wm.closeWindow(id)}
              onMinimize={() => wm.minimizeWindow(id)}
              onDragStart={(e) => {
                if (wm.overview) { e.preventDefault(); wm.setOverview(false); wm.focusWindow(id); return; }
                (wm.tiling ? wm.startTileDrag : wm.startMove)(id, e);
              }}
              onResizeStart={(e) => wm.startResize(id, e)}
            >
              <Suspense fallback={FALLBACK}>{renderContent(win)}</Suspense>
            </WindowFrame>
          </ErrorBoundary>
        );
      })}

      {wm.tiling && !wm.overview && (
        <Dividers dividers={wm.dividers} onDragStart={wm.startDivider} onNudge={wm.nudgeDivider} />
      )}
      {!wm.overview && <SwapTarget rect={swapRect} />}
      {dragWin && (
        <DragGhost
          cursor={wm.drag.cursor}
          title={RICE_APPS[dragWin.app]?.title || dragWin.app}
          color={RICE_APPS[dragWin.app]?.color}
        />
      )}

      <TopBar
        activeWorkspace={wm.activeWorkspace}
        occupied={wm.occupied}
        onWorkspace={wm.switchWorkspace}
        focusedTitle={wm.focusedId ? RICE_APPS[wm.windows[wm.focusedId]?.app]?.title : ''}
        layout={wm.layout}
        onToggleLayout={wm.toggleLayout}
        onOverview={() => wm.setOverview((o) => !o)}
        onPower={() => setIsPowerOpen(true)}
        stats={stats}
      />

      <Dock windows={wm.dockWindows} onSelect={wm.focusWindow} />

      <Launcher isOpen={isLauncherOpen} onLaunch={launch} onClose={() => setIsLauncherOpen(false)} />
      <PowerMenu isOpen={isPowerOpen} onClose={() => setIsPowerOpen(false)} onAction={handlePower} />
      <KeybindCheatsheet isOpen={isCheatsheetOpen} onClose={() => setIsCheatsheetOpen(false)} />
      <Notifications items={notifications} onDismiss={dismiss} />
    </div>
  );
}
