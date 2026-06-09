import { useState, useEffect, useRef } from 'react';
import CommandInput from './CommandInput';
import { handleCommand } from '../utils/commandHandler';
import Hero from '../sections/Hero';
import styles from './Terminal.module.css';

export default function Terminal({ setWallpaper, initialCommand, setInitialCommand }) {
    const welcomeLines = ['Microsoft Windows [Version 10.0.26200.7171]', '(c) Microsoft Corporation. All rights reserved.', ''];
    const [history, setHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(true);
    const [inputMode, setInputMode] = useState('command'); // 'command' or 'password'
    const [pendingCommand, setPendingCommand] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const bottomRef = useRef(null);

    const onCommandSubmit = (input) => {
        if (inputMode === 'password') {
            if (input === 'admin') {
                setIsAdmin(true);
                if (pendingCommand) {
                    const output = handleCommand(pendingCommand, { isAdmin: true, setWallpaper, setIsAdmin });
                    setHistory((prev) => [
                        ...prev,
                        { command: 'sudo ' + pendingCommand, output }
                    ]);
                } else {
                    setHistory([
                        { command: '', output: { type: 'component', content: <Hero /> } }
                    ]);
                }
            } else {
                setHistory((prev) => [
                    ...prev,
                    { command: '', output: { type: 'text', content: ['sudo: incorrect password attempt.', 'Access denied.'] } }
                ]);
            }
            setInputMode('command');
            setPendingCommand(null);
            return;
        }

        // Special handling for sudo/welcome
        if (input.trim() === 'sudo') {
            setHistory((prev) => [
                ...prev,
                { command: input, output: { type: 'text', content: [] } } // Empty output, prompt handled by input mode
            ]);
            setInputMode('password');
            return;
        }

        const output = handleCommand(input, { isAdmin, setWallpaper, setIsAdmin });

        if (output.type === 'action') {
            if (output.action === 'clear') {
                setHistory([
                    { command: '', output: { type: 'text', content: ['Microsoft Windows [Version 10.0.26200.7171]', '(c) Microsoft Corporation. All rights reserved.', ''] } },
                ]);
            } else if (output.action === 'sudo') {
                if (isAdmin) {
                    setHistory((prev) => [...prev, { command: input, output: { type: 'text', content: ['You are already root.'] } }]);
                } else {
                    setHistory((prev) => [...prev, { command: input, output: { type: 'text', content: ['[sudo] password for visitor:'] } }]);
                    setInputMode('password');
                    setPendingCommand(output.pendingCommand || null);
                }
            }
        } else {
            setHistory((prev) => [...prev, { command: input, output }]);
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    useEffect(() => {
        if (history.length === 0 && isTyping) {
            let currentLine = 0;
            let currentChar = 0;
            let tempContent = ['', '', ''];

            const typeChar = () => {
                if (currentLine >= welcomeLines.length) {
                    setIsTyping(false);
                    return;
                }
                
                if (currentChar < welcomeLines[currentLine].length) {
                    tempContent[currentLine] += welcomeLines[currentLine][currentChar];
                    currentChar++;
                } else {
                    currentLine++;
                    currentChar = 0;
                }
                
                setHistory([
                    { command: '', output: { type: 'text', content: [...tempContent] } }
                ]);

                if (currentLine < welcomeLines.length) {
                    setTimeout(typeChar, 10);
                } else {
                    setIsTyping(false);
                }
            };
            
            setTimeout(typeChar, 300);
        }
    }, []);

    useEffect(() => {
        if (!isTyping && initialCommand) {
            onCommandSubmit(initialCommand);
            if (setInitialCommand) setInitialCommand(null);
        }
    }, [initialCommand, isTyping]);

    return (
        <div className={styles.terminalContainer}>
            <div className={styles.terminalHistory}>
                {history.map((entry, index) => (
                    <div key={index} className={styles.historyEntry}>
                        {entry.command && (
                            <div className={styles.commandLine}>
                                <span className={`${styles.prompt} ${isAdmin ? styles.adminPrompt : ''}`}>
                                    {isAdmin ? 'C:\\Users\\admin>' : 'C:\\Users\\lenovo>'}
                                </span>
                                <span className={styles.command}>{entry.command}</span>
                            </div>
                        )}
                        <div className={styles.output}>
                            {entry.output.type === 'text' ? (
                                entry.output.content.map((line, i) => <div key={i}>{line}</div>)
                            ) : (
                                entry.output.content
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {!isTyping && (
                <CommandInput
                    onSubmit={onCommandSubmit}
                    mode={inputMode}
                    history={history.map(h => h.command).filter(c => c !== '')}
                    isAdmin={isAdmin}
                />
            )}
            <div ref={bottomRef} />
        </div>
    );
}
