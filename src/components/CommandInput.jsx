import { useState, useEffect, useRef } from 'react';
import styles from './CommandInput.module.css';

export default function CommandInput({ onSubmit, mode = 'command', history = [], isAdmin = false }) {
    const [input, setInput] = useState('');
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [suggestion, setSuggestion] = useState('');
    const inputRef = useRef(null);

    const availableCommands = [
        'about', 'projects', 'contact', 'clear', 'help', 'fastfetch', 
        'sudo', 'wallpaper', 'exit', 'ask', 'chat', 'github', 'skills', 'theme'
    ];

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [history]);

    const [tempInput, setTempInput] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSubmit(input);
            setInput('');
            setHistoryIndex(-1);
            setTempInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                if (historyIndex === -1) {
                    setTempInput(input);
                }
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
                setInput(tempInput);
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            if (suggestion) {
                setInput(suggestion);
                setSuggestion('');
            }
        }
    };

    useEffect(() => {
        if (input.trim() === '') {
            setSuggestion('');
            return;
        }
        const match = availableCommands.find(cmd => cmd.startsWith(input.toLowerCase()) && cmd !== input.toLowerCase());
        if (match) {
            setSuggestion(match);
        } else {
            setSuggestion('');
        }
    }, [input]);

    const suggestionGhost = suggestion && suggestion.startsWith(input.toLowerCase()) ? suggestion.slice(input.length) : '';

    return (
        <div className={styles.commandInput} onClick={() => inputRef.current?.focus()}>
            {mode === 'command' && (
                <span className={`${styles.prompt} ${isAdmin ? styles.adminPrompt : ''}`}>
                    {isAdmin ? 'C:\\Users\\admin>' : 'C:\\Users\\lenovo>'}
                </span>
            )}
            {mode === 'password' && <span className={styles.prompt}>Password:</span>}
            <div className={styles.inputWrapper}>
                <span className={styles.inputText}>{mode === 'password' ? '*'.repeat(input.length) : input}</span>
                {mode !== 'password' && suggestionGhost && (
                    <span className={styles.suggestionGhost}>{suggestionGhost}</span>
                )}
                <span className={styles.cursor}>█</span>
                <input
                    ref={inputRef}
                    type={mode === 'password' ? 'password' : 'text'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={styles.hiddenInput}
                    autoFocus
                    autoComplete="off"
                    spellCheck="false"
                />
            </div>
        </div>
    );
}
