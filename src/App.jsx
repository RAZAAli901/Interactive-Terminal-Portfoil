import { useState } from 'react';
import Terminal from "./components/Terminal";
import LoadingScreen from "./components/LoadingScreen";
import Window from "./components/Window";
import Taskbar from "./components/Taskbar";
import DesktopIcon from "./components/DesktopIcon";
import StartMenu from "./components/StartMenu";
import ExplorerWindow from "./components/ExplorerWindow";
import Notepad from "./components/Notepad";
import styles from './App.module.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [wallpaper, setWallpaper] = useState(1); // Default wallpaper ID

  // Window State
  const [terminalState, setTerminalState] = useState({
    isOpen: true,
    isMinimized: false,
  });

  const [explorerState, setExplorerState] = useState({
    isOpen: false,
    isMinimized: false,
  });

  const [notepadState, setNotepadState] = useState({
    isOpen: false,
    isMinimized: false,
  });

  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [terminalInitialCommand, setTerminalInitialCommand] = useState(null);

  const wallpapers = {
    1: 'https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?q=80&w=2073&auto=format&fit=crop', // Glitch/Broken Screen alternative
    2: '/wallpapers/wp1.jpg', // User Wallpaper 1
    3: '/wallpapers/wp2.jpg', // User Wallpaper 2
    4: '/wallpapers/wp3.jpg', // User Wallpaper 3
    5: '/wallpapers/wp4.jpg', // User Wallpaper 4
    6: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2070&auto=format&fit=crop', // Code
    7: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop', // Gaming
    8: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', // Space
    9: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop', // Circuit
    10: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop', // Landscape
    11: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop', // Beach
    12: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop', // Mountains
  };

  const toggleTerminal = () => {
    if (!terminalState.isOpen) {
      setTerminalState({ isOpen: true, isMinimized: false });
    } else {
      setTerminalState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
    }
  };

  const toggleExplorer = () => {
    if (!explorerState.isOpen) {
      setExplorerState({ isOpen: true, isMinimized: false });
    } else {
      setExplorerState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
    }
  };

  const closeTerminal = () => {
    setTerminalState({ isOpen: false, isMinimized: false });
  };

  const closeExplorer = () => {
    setExplorerState({ isOpen: false, isMinimized: false });
  };

  const closeNotepad = () => {
    setNotepadState({ isOpen: false, isMinimized: false });
  };

  const openTerminal = () => {
    setTerminalState({ isOpen: true, isMinimized: false });
    setIsStartMenuOpen(false);
  };

  const openExplorer = () => {
    setExplorerState({ isOpen: true, isMinimized: false });
    setIsStartMenuOpen(false);
  };

  const openNotepad = () => {
    setNotepadState({ isOpen: true, isMinimized: false });
    setIsStartMenuOpen(false);
  };

  const toggleNotepad = () => {
    if (!notepadState.isOpen) {
      setNotepadState({ isOpen: true, isMinimized: false });
    } else {
      setNotepadState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
    }
  };

  const openTerminalWithCommand = (cmd) => {
    setTerminalInitialCommand(cmd);
    setTerminalState({ isOpen: true, isMinimized: false });
    setIsStartMenuOpen(false);
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

  return (
    <div
      className={styles.desktop}
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
              onDoubleClick={openTerminal}
            />
            <DesktopIcon
              label="My Computer"
              icon="🖥️"
              onDoubleClick={openExplorer}
            />
            <DesktopIcon
              label="Recycle Bin"
              icon="🗑️"
              onDoubleClick={() => alert("Empty")}
            />
            <DesktopIcon
              label="Notepad"
              icon="📝"
              onDoubleClick={openNotepad}
            />
          </div>

          {terminalState.isOpen && (
            <Window
              title="Command Prompt"
              onClose={closeTerminal}
              onMinimize={() => setTerminalState(prev => ({ ...prev, isMinimized: true }))}
              isMinimized={terminalState.isMinimized}
              defaultWidth={800}
              defaultHeight={500}
              offsetX={0}
              offsetY={0}
            >
              <Terminal setWallpaper={setWallpaper} initialCommand={terminalInitialCommand} setInitialCommand={setTerminalInitialCommand} />
            </Window>
          )}

          {explorerState.isOpen && (
            <Window
              title="My Computer"
              onClose={closeExplorer}
              onMinimize={() => setExplorerState(prev => ({ ...prev, isMinimized: true }))}
              isMinimized={explorerState.isMinimized}
            >
              <ExplorerWindow />
            </Window>
          )}

          {notepadState.isOpen && (
            <Window
              title="Notepad"
              onClose={closeNotepad}
              onMinimize={() => setNotepadState(prev => ({ ...prev, isMinimized: true }))}
              isMinimized={notepadState.isMinimized}
              defaultWidth={650}
              defaultHeight={500}
              offsetX={80}
              offsetY={40}
            >
              <Notepad />
            </Window>
          )}

          <StartMenu
            isOpen={isStartMenuOpen}
            onAppClick={(app) => {
              if (app === 'terminal') openTerminal();
              if (app === 'explorer') openExplorer();
            }}
          />

          <Taskbar
            windows={[
              { id: 'terminal', title: 'Terminal', isOpen: terminalState.isOpen, isMinimized: terminalState.isMinimized },
              { id: 'explorer', title: 'My Computer', isOpen: explorerState.isOpen, isMinimized: explorerState.isMinimized },
              { id: 'notepad', title: 'Notepad', isOpen: notepadState.isOpen, isMinimized: notepadState.isMinimized }
            ].filter(w => w.isOpen)}
            onToggleWindow={(id) => {
              if (id === 'terminal') toggleTerminal();
              if (id === 'explorer') toggleExplorer();
              if (id === 'notepad') toggleNotepad();
            }}
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
              <div className={styles.contextMenuItem} onClick={openTerminal}>
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
