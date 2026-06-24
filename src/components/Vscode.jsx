import { useState, useEffect, useRef } from 'react';
import styles from './Vscode.module.css';

export default function Vscode() {
    const containerRef = useRef(null);
    const editorRef = useRef(null);
    const [monacoLoaded, setMonacoLoaded] = useState(false);

    useEffect(() => {
        const loadMonaco = () => {
            if (window.monaco) {
                setMonacoLoaded(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs/loader.min.js';
            script.async = true;
            script.onload = () => {
                window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
                window.require(['vs/editor/editor.main'], () => {
                    setMonacoLoaded(true);
                });
            };
            document.body.appendChild(script);
        };
        loadMonaco();
    }, []);
    const files = {
        'App.jsx': `import { useState, useEffect } from 'react';
import Terminal from "./components/Terminal";
import Window from "./components/Window";
import Taskbar from "./components/Taskbar";
import DesktopIcon from "./components/DesktopIcon";

export default function App() {
  const [windows, setWindows] = useState({
    terminal: { id: 'terminal', title: 'Command Prompt', icon: '💻', isOpen: true, isMinimized: false, zIndex: 10 },
    explorer: { id: 'explorer', title: 'My Computer', icon: '🖥️', isOpen: false, isMinimized: false, zIndex: 1 }
  });
  const [maxZIndex, setMaxZIndex] = useState(10);

  const openWindow = (id) => {
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: nextZ }
    }));
  };

  return (
    <div className="desktop">
      <div className="desktopIcons">
        <DesktopIcon label="Terminal" icon="💻" onDoubleClick={() => openWindow('terminal')} />
      </div>
      <Taskbar windows={Object.values(windows)} />
    </div>
  );
}`,
        'Terminal.jsx': `import { useState, useEffect, useRef } from 'react';
import CommandInput from './CommandInput';
import { handleCommand } from '../utils/commandHandler';

export default function Terminal({ setTheme, setWallpaper }) {
    const [history, setHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    const onCommandSubmit = (input) => {
        const output = handleCommand(input, { setTheme, setWallpaper });
        setHistory((prev) => [...prev, { command: input, output }]);
    };

    return (
        <div className="terminalContainer">
            <div className="terminalHistory">
                {history.map((entry, index) => (
                    <div key={index}>
                        <span>{'> '}{entry.command}</span>
                        <div>{entry.output.content}</div>
                    </div>
                ))}
            </div>
            <CommandInput onSubmit={onCommandSubmit} />
        </div>
    );
}`,
        'commandHandler.jsx': `import { parseAiQuery } from './aiParser';

export const handleCommand = (command, { setTheme, setWallpaper } = {}) => {
    const trimmedCommand = command.trim().toLowerCase();
    const args = trimmedCommand.split(' ');
    const cmd = args[0];

    switch (cmd) {
        case 'help':
            return {
                type: 'text',
                content: ['about - Bio', 'projects - Portfolio', 'skills - Skill list', 'theme - Switch colors']
            };
        case 'ask':
        case 'chat':
            return { type: 'ai-assistant', query: args.slice(1).join(' ') };
        case 'theme':
            return { type: 'action', action: 'theme', theme: args[1] };
        default:
            return { type: 'text', content: [\`Command not found: \${cmd}\`] };
    }
};`
    };

    const [activeFile, setActiveFile] = useState('App.jsx');

    useEffect(() => {
        if (!monacoLoaded) return;
        
        if (containerRef.current) {
            editorRef.current = window.monaco.editor.create(containerRef.current, {
                value: files[activeFile],
                language: activeFile.endsWith('.css') ? 'css' : 'javascript',
                theme: 'vs-dark',
                readOnly: true,
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'Consolas', 'Lucida Console', monospace",
            });
        }

        return () => {
            if (editorRef.current) {
                editorRef.current.dispose();
            }
        };
    }, [monacoLoaded]);

    useEffect(() => {
        if (editorRef.current && monacoLoaded) {
            editorRef.current.setValue(files[activeFile]);
            const model = editorRef.current.getModel();
            if (model) {
                const lang = activeFile.endsWith('.css') ? 'css' : (activeFile.endsWith('.jsx') ? 'javascript' : 'javascript');
                window.monaco.editor.setModelLanguage(model, lang);
            }
        }
    }, [activeFile, monacoLoaded]);

    return (
        <div className={styles.vscodeContainer}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarTitle}>Explorer: Workspace</div>
                <div className={styles.fileList}>
                    {Object.keys(files).map(fileName => (
                        <div 
                            key={fileName}
                            className={`${styles.fileItem} ${activeFile === fileName ? styles.fileActive : ''}`}
                            onClick={() => setActiveFile(fileName)}
                        >
                            ⚛️ {fileName}
                        </div>
                    ))}
                </div>
            </div>

            {/* Code Area */}
            <div className={styles.editorArea}>
                <div className={styles.tabHeader}>
                    <div className={`${styles.tab} ${styles.activeTab}`}>
                        ⚛️ {activeFile}
                    </div>
                </div>
                <div 
                    ref={containerRef} 
                    className={styles.monacoContainer} 
                    style={{ width: '100%', height: 'calc(100% - 35px)', background: '#1e1e1e' }}
                />
            </div>
        </div>
    );
}
