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
        'App.jsx': `import { useState } from 'react';
import Terminal from "./components/Terminal";
import Window from "./components/Window";
import Taskbar from "./components/Taskbar";

export default function App() {
  const [windows, setWindows] = useState({
    terminal: { isOpen: true, title: 'Terminal' }
  });

  return (
    <div className="desktop">
      <Taskbar windows={windows} />
    </div>
  );
}`,
        'Terminal.jsx': `import { useState } from 'react';
import { handleCommand } from '../utils/commandHandler';

export default function Terminal() {
  const [history, setHistory] = useState([]);

  const onSubmit = (input) => {
    const out = handleCommand(input);
    setHistory([...history, { input, out }]);
  };

  return <div className="terminal">Running...</div>;
}`,
        'commandHandler.jsx': `export const handleCommand = (cmd) => {
  switch (cmd.trim().toLowerCase()) {
    case 'help':
      return ['about', 'projects', 'contact', 'clear'];
    case 'about':
      return 'Full stack developer portfolio OS.';
    default:
      return 'Command not found';
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
