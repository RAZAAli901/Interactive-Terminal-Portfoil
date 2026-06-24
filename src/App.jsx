import { useState, useEffect } from 'react';
import Terminal from "./components/Terminal";
import LoadingScreen from "./components/LoadingScreen";
import Window from "./components/Window";
import Taskbar from "./components/Taskbar";
import DesktopIcon from "./components/DesktopIcon";
import StartMenu from "./components/StartMenu";
import ExplorerWindow from "./components/ExplorerWindow";
import Notepad from "./components/Notepad";

// New dynamic apps
import Calculator from "./components/Calculator";
import Clock from "./components/Clock";
import Settings from "./components/Settings";
import Browser from "./components/Browser";
import Chat from "./components/Chat";
import Photos from "./components/Photos";
import Solitaire from "./components/Solitaire";
import OfficeApp from "./components/OfficeApp";
import Store from "./components/Store";
import SnippingTool from "./components/SnippingTool";
import Vscode from "./components/Vscode";
import Minesweeper from "./components/Minesweeper";

import styles from './App.module.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [wallpaper, setWallpaper] = useState(4); // Default wallpaper ID
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'retro');

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
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

  // Global zIndex coordinator
  const [maxZIndex, setMaxZIndex] = useState(10);

  // Dynamic window list
  const [windows, setWindows] = useState({
    terminal: { id: 'terminal', title: 'Command Prompt', icon: '💻', isOpen: true, isMinimized: false, zIndex: 10, defaultWidth: 800, defaultHeight: 500, offsetX: 0, offsetY: 0 },
    explorer: { id: 'explorer', title: 'My Computer', icon: '🖥️', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 800, defaultHeight: 500 },
    notepad: { id: 'notepad', title: 'Notepad', icon: '📝', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 650, defaultHeight: 500, offsetX: 80, offsetY: 40 },
    chat: { id: 'chat', title: 'Chat', icon: '💬', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 700, defaultHeight: 500 },
    browser: { id: 'browser', title: 'Web Browser', icon: '🌐', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 900, defaultHeight: 600 },
    settings: { id: 'settings', title: 'Settings', icon: '⚙️', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 750, defaultHeight: 500 },
    calculator: { id: 'calculator', title: 'Calculator', icon: '🧮', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 320, defaultHeight: 480 },
    clock: { id: 'clock', title: 'Clock', icon: '⏰', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 450, defaultHeight: 400 },
    store: { id: 'store', title: 'Microsoft Store', icon: '🛍️', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 900, defaultHeight: 600 },
    photos: { id: 'photos', title: 'Photos', icon: '🖼️', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 700, defaultHeight: 500 },
    solitaire: { id: 'solitaire', title: 'Solitaire', icon: '🃏', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 700, defaultHeight: 550 },
    word: { id: 'word', title: 'Word - Document1.docx', icon: '📝', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 750, defaultHeight: 550 },
    excel: { id: 'excel', title: 'Excel - Book1.xlsx', icon: '📊', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 800, defaultHeight: 500 },
    powerpoint: { id: 'powerpoint', title: 'PowerPoint - Presentation1.pptx', icon: '🔴', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 800, defaultHeight: 550 },
    outlook: { id: 'outlook', title: 'Outlook', icon: '📧', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 850, defaultHeight: 550 },
    snipping: { id: 'snipping', title: 'Snipping Tool', icon: '✂️', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 600, defaultHeight: 450 },
    onenote: { id: 'onenote', title: 'OneNote', icon: '📓', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 750, defaultHeight: 500 },
    vscode: { id: 'vscode', title: 'Visual Studio Code', icon: '💙', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 900, defaultHeight: 600 },
    minesweeper: { id: 'minesweeper', title: 'MineSweeper', icon: '💣', isOpen: false, isMinimized: false, zIndex: 1, defaultWidth: 400, defaultHeight: 500 }
  });

  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [terminalInitialCommand, setTerminalInitialCommand] = useState(null);

  const wallpapers = {
    1: 'https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?q=80&w=2073&auto=format&fit=crop', // Glitch/Broken Screen alternative
    2: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2070&auto=format&fit=crop', // Cyberpunk neon
    3: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop', // Vaporwave grid
    4: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=2070&auto=format&fit=crop', // Abstract code
    5: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop', // Minimalist background
    6: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2070&auto=format&fit=crop', // Code
    7: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop', // Gaming
    8: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', // Space
    9: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop', // Circuit
    10: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop', // Landscape
    11: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop', // Beach
    12: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop', // Mountains
  };

  const openWindow = (id) => {
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: nextZ }
    }));
    setIsStartMenuOpen(false);
  };

  const closeWindow = (id) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false, isMinimized: false }
    }));
  };

  const minimizeWindow = (id) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true }
    }));
  };

  const toggleWindow = (id) => {
    setWindows(prev => {
      const win = prev[id];
      if (!win) return prev;
      if (!win.isOpen) {
        const nextZ = maxZIndex + 1;
        setMaxZIndex(nextZ);
        return {
          ...prev,
          [id]: { ...win, isOpen: true, isMinimized: false, zIndex: nextZ }
        };
      } else if (win.isMinimized) {
        const nextZ = maxZIndex + 1;
        setMaxZIndex(nextZ);
        return {
          ...prev,
          [id]: { ...win, isMinimized: false, zIndex: nextZ }
        };
      } else {
        return {
          ...prev,
          [id]: { ...win, isMinimized: true }
        };
      }
    });
  };

  const focusWindow = (id) => {
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], zIndex: nextZ }
    }));
  };

  const openTerminalWithCommand = (cmd) => {
    setTerminalInitialCommand(cmd);
    openWindow('terminal');
  };

  const handleDesktopClick = (e) => {
    if (contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0 });
    if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
      setIsStartMenuOpen(false);
    }
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
      className={`${styles.desktop} theme-${theme} ${isMobile ? 'mobile-terminal-active' : ''}`}
      style={{ backgroundImage: `url(${wallpapers[wallpaper]})` }}
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      <div className={styles.desktopOverlay}></div>
      {isLoading ? (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      ) : (
        <>
          <div className={styles.desktopIcons}>
            <DesktopIcon
              label="Terminal"
              icon="💻"
              onDoubleClick={() => openWindow('terminal')}
            />
            <DesktopIcon
              label="My Computer"
              icon="🖥️"
              onDoubleClick={() => openWindow('explorer')}
            />
            <DesktopIcon
              label="Recycle Bin"
              icon="🗑️"
              onDoubleClick={() => alert("Recycle bin is empty.")}
            />
            <DesktopIcon
              label="Notepad"
              icon="📝"
              onDoubleClick={() => openWindow('notepad')}
            />
            <DesktopIcon
              label="Chat"
              icon="💬"
              onDoubleClick={() => openWindow('chat')}
            />
            <DesktopIcon
              label="Browser"
              icon="🌐"
              onDoubleClick={() => openWindow('browser')}
            />
            {installedApps.vscode && (
              <DesktopIcon
                label="VS Code"
                icon="💙"
                onDoubleClick={() => openWindow('vscode')}
              />
            )}
            {installedApps.minesweeper && (
              <DesktopIcon
                label="MineSweeper"
                icon="💣"
                onDoubleClick={() => openWindow('minesweeper')}
              />
            )}
          </div>

          {Object.values(windows).map(win => {
            if (!win.isOpen) return null;
            return (
              <Window
                key={win.id}
                title={win.title}
                icon={win.icon}
                onClose={() => closeWindow(win.id)}
                onMinimize={() => minimizeWindow(win.id)}
                isMinimized={win.isMinimized}
                defaultWidth={win.defaultWidth}
                defaultHeight={win.defaultHeight}
                offsetX={win.offsetX}
                offsetY={win.offsetY}
                zIndex={win.zIndex}
                onFocus={() => focusWindow(win.id)}
              >
                {renderWindowContent(win.id)}
              </Window>
            );
          })}

          <StartMenu
            isOpen={isStartMenuOpen}
            onAppClick={(appId) => openWindow(appId)}
          />

          <Taskbar
            windows={Object.values(windows).filter(w => w.isOpen)}
            onToggleWindow={(id) => toggleWindow(id)}
            onToggleStartMenu={() => setIsStartMenuOpen(!isStartMenuOpen)}
            isStartMenuOpen={isStartMenuOpen}
          />

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
