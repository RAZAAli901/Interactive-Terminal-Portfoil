import { useState, useEffect, useRef } from 'react';
import styles from './CommandInput.module.css';

export default function CommandInput({ onSubmit, mode = 'command', history = [], isAdmin = false }) {
    const [input, setInput] = useState('');
    const [historyIndex, setHistoryIndex] = useState(-1);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [history]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSubmit(input);
            setInput('');
            setHistoryIndex(-1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
                setHistoryIndex(newIndex);
                setInput(history[history.length - 1 - newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(history[history.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    return (
        <div className={styles.commandInput}>
            {mode === 'command' && (
                <span className={`${styles.prompt} ${isAdmin ? styles.adminPrompt : ''}`}>
                    {isAdmin ? 'C:\\Users\\admin>' : 'C:\\Users\\lenovo>'}
                </span>
            )}
            {mode === 'password' && <span className={styles.prompt}>Password:</span>}
            <input
                ref={inputRef}
                type={mode === 'password' ? 'password' : 'text'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={styles.terminalInput}
                autoFocus
            />
        </div>
    );
}
