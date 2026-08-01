import { useState, useEffect, useRef } from 'react';
import styles from './CommandInput.module.css';

import { commands } from '../utils/commandHandler';

export default function CommandInput({ onSubmit, mode = 'command', history = [], isAdmin = false }) {
    const [input, setInput] = useState('');
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [suggestion, setSuggestion] = useState('');
    const [prefix, setPrefix] = useState('');
    const [filteredHistory, setFilteredHistory] = useState([]);
    const inputRef = useRef(null);

    const availableCommands = commands.map(c => c.name);

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
            setPrefix('');
            setFilteredHistory([]);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                let currentFiltered = filteredHistory;
                if (historyIndex === -1) {
                    setPrefix(input);
                    // Filter history starting with the prefix, keeping uniqueness
                    const uniqueHistory = Array.from(new Set(history));
                    currentFiltered = uniqueHistory.filter(cmd => 
                        cmd.toLowerCase().startsWith(input.toLowerCase())
                    );
                    setFilteredHistory(currentFiltered);
                }
                
                if (currentFiltered.length > 0) {
                    const newIndex = historyIndex < currentFiltered.length - 1 ? historyIndex + 1 : historyIndex;
                    setHistoryIndex(newIndex);
                    setInput(currentFiltered[currentFiltered.length - 1 - newIndex]);
                }
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(filteredHistory[filteredHistory.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput(prefix);
                setPrefix('');
                setFilteredHistory([]);
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            if (suggestion) {
                setInput(suggestion);
                setSuggestion('');
            }
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        setHistoryIndex(-1);
        setPrefix('');
        setFilteredHistory([]);
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
        // `availableCommands` is a constant list; recomputing the suggestion on
        // input alone is the intended behaviour.
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    onChange={handleInputChange}
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
