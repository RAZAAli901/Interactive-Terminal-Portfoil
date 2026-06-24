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
    const [codeContent, setCodeContent] = useState(files);

    const handleCodeChange = (e) => {
        const value = e.target.value;
        setCodeContent(prev => ({ ...prev, [activeFile]: value }));
    };

    const lines = codeContent[activeFile].split('\n');

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
                <div className={styles.codeEditor}>
                    <div className={styles.lineNumbers}>
                        {lines.map((_, idx) => (
                            <div key={idx}>{idx + 1}</div>
                        ))}
                    </div>
                    <textarea 
                        className={styles.codeArea}
                        value={codeContent[activeFile]}
                        onChange={handleCodeChange}
                        spellCheck="false"
                    />
                </div>
            </div>
        </div>
    );
}
