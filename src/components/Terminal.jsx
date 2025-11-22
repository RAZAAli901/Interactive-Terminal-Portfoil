import { useState, useEffect, useRef } from 'react';
import CommandInput from './CommandInput';
import { handleCommand } from '../utils/commandHandler';
import Hero from '../sections/Hero';

export default function Terminal({ setWallpaper }) {
    const [history, setHistory] = useState([
        { command: 'welcome', output: { type: 'component', content: <Hero /> } },
    ]);
    const [inputMode, setInputMode] = useState('command'); // 'command' or 'password'
    const [pendingCommand, setPendingCommand] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const bottomRef = useRef(null);

    const onCommandSubmit = (input) => {
        if (inputMode === 'password') {
            if (input === 'admin123') {
                setIsAdmin(true);
                setHistory((prev) => [
                    ...prev,
                    { command: '', output: { type: 'text', content: ['Access Granted. Welcome, Admin.'] } },
                ]);
                if (pendingCommand) {
                    const output = handleCommand(pendingCommand, { isAdmin: true, setWallpaper, setIsAdmin });
                    setHistory((prev) => [...prev, { command: pendingCommand, output }]);
                } else {
                    setHistory((prev) => [...prev, { command: '', output: { type: 'text', content: ['Root shell access granted (simulation).'] } }]);
                }
            } else {
                setHistory((prev) => [
                    ...prev,
                    { command: '', output: { type: 'text', content: ['Sorry, try again.'] } },
                ]);
            }
            setInputMode('command');
            setPendingCommand(null);
            return;
        }

        const output = handleCommand(input, { isAdmin, setWallpaper, setIsAdmin });

        if (output.type === 'action') {
            if (output.action === 'clear') {
                setHistory([]);
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

    return (
        <div className="terminal-container">
            <div className="terminal-history">
                {history.map((entry, index) => (
                    <div key={index} className="history-entry">
                        {entry.command !== 'welcome' && (
                            <div className="command-line">
                                <span className={`prompt ${isAdmin ? 'admin-prompt' : ''}`}>
                                    {isAdmin ? 'admin@portfolio:' : 'visitor@portfolio:~$'}
                                </span>
                                <span className="command">{entry.command}</span>
                            </div>
                        )}
                        <div className="output">
                            {entry.output.type === 'text' ? (
                                entry.output.content.map((line, i) => <div key={i}>{line}</div>)
                            ) : (
                                entry.output.content
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <CommandInput
                onSubmit={onCommandSubmit}
                mode={inputMode}
                history={history.map(h => h.command).filter(c => c !== 'welcome' && c !== '')}
                isAdmin={isAdmin}
            />
            <div ref={bottomRef} />
        </div>
    );
}
