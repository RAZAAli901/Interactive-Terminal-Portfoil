import { useState, useEffect, useRef } from 'react';
import styles from './Vscode.module.css';

/**
 * Vscode component rendering a read-only code showcase using Monaco Editor
 * loaded dynamically from a public CDN (cdnjs).
 */

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
        'App.jsx': `import { useRiceWM } from "./wm/useRiceWM";
import { useKeybindings } from "./wm/useKeybindings";
import { overviewLayout } from "./shell/overviewGrid";
import WindowFrame from "./wm/WindowFrame";
import { Dividers } from "./wm/TilingOverlays";
import TopBar from "./shell/TopBar";
import Dock from "./shell/Dock";

export default function App() {
  const wm = useRiceWM(RICE_APPS);

  useKeybindings({
    launcher: () => setLauncherOpen(o => !o),
    workspace: (n) => wm.switchWorkspace(n),
    toggleFloat: () => wm.toggleLayout(),
  });

  return (
    <div className="desktop">
      <NeuralCanvas accent={theme.role.accent} />
      <TopBar activeWorkspace={wm.activeWorkspace} onPower={openPower} />

      {/* Every window stays mounted; off-workspace ones are hidden so
          their app state survives a workspace switch. */}
      {wm.mountedIds.map((id) => (
        <WindowFrame
          key={id}
          rect={wm.geometry[id]}
          hidden={wm.windows[id].ws !== wm.activeWorkspace}
          isActive={id === wm.focusedId}
          onDragStart={(e) => wm.startTileDrag(id, e)}
        />
      ))}

      {/* Drag the gaps to re-ratio the BSP splits. */}
      <Dividers dividers={wm.dividers} onDragStart={wm.startDivider} />
      <Dock windows={wm.dockWindows} onSelect={wm.focusWindow} />
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
    const [terminalLogs, setTerminalLogs] = useState([]);
    const [showTerminal, setShowTerminal] = useState(false);
    const runCode = () => {
        setShowTerminal(true);
        setTerminalLogs(['$ npm run build', '⚙️ Bundling modules using rolldown-vite...', '✓ 24 modules transformed successfully.', '✨ Build completed in 241ms!', '🚀 Preview server listening at http://localhost:5173/']);
    };

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
        // Monaco is created once the loader resolves and reads whatever file is
        // active at that moment; later file changes go through the effect below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // Keyed on the active file: `files` is static content, so including it
        // would only add churn.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFile, monacoLoaded]);

    return (
        <div className={styles.vscodeContainer}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarTitle}>Explorer: Workspace</div>
                <div style={{ fontSize: '11px', color: '#6a737d', paddingLeft: '8px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>📁 src</div>
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
                {showTerminal && (
                    <div style={{ height: '115px', background: '#0d1117', borderTop: '2px solid #30363d', color: '#c9d1d9', padding: '10px', fontFamily: 'monospace', fontSize: '12px', overflowY: 'auto', position: 'absolute', bottom: 0, left: '200px', right: 0, zIndex: 100 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #30363d', paddingBottom: '4px', marginBottom: '6px' }}>
                            <span style={{ color: '#58a6ff', fontWeight: 'bold' }}>Terminal Console Output</span>
                            <button onClick={() => setShowTerminal(false)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer' }}>✕</button>
                        </div>
                        {terminalLogs.map((log, i) => <div key={i}>{log}</div>)}
                    </div>
                )}
                <div className={styles.tabHeader}>
                    <div className={`${styles.tab} ${styles.activeTab}`}>
                        ⚛️ {activeFile}
                    </div>
                    <button onClick={runCode} style={{ background: '#107c41', color: '#fff', border: 'none', borderRadius: '3px', padding: '3px 8px', fontSize: '11px', marginLeft: 'auto', marginRight: '10px', cursor: 'pointer' }}>
                        ▶ Run Build
                    </button>
                </div>
                <div 
                    ref={containerRef} 
                    className={styles.monacoContainer} 
                    style={{ width: '100%', height: showTerminal ? 'calc(100% - 150px)' : 'calc(100% - 35px)', background: '#1e1e1e' }}
                />
            </div>
        </div>
    );
}
