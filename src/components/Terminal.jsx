import { useState, useEffect, useRef } from 'react';
import CommandInput from './CommandInput';
import { handleCommand } from '../utils/commandHandler';
import { getHistory, saveHistory } from '../utils/localStorage';
import { fetchGithubData, getClaudeResponse } from '../utils/apiClient';
import { formatTable, formatSuccess, formatError, formatInfo, formatWarning, formatSection } from '../utils/terminalFormatting';
import MatrixScreensaver from './MatrixScreensaver';
import Hero from '../sections/Hero';
import portfolioData from '../data/portfolio.json';
import styles from './Terminal.module.css';

export default function Terminal({ setTheme, setWallpaper, initialCommand, setInitialCommand }) {
    const welcomeLines = [
        'Arch Linux (rolling) — kitty terminal',
        '',
        "Type 'help' or 'commands' to list available utilities.",
        "Simulated filesystem mounted at /portfolio. Try 'ls' or 'cd'.",
        ''
    ];

    const [history, setHistory] = useState([]);
    const [sessionHistory, setSessionHistory] = useState(() => getHistory());
    const [isTyping, setIsTyping] = useState(true);
    const [inputMode, setInputMode] = useState('command'); // 'command' | 'password' | 'confirm' | 'chat'
    const [pendingCommand, setPendingCommand] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentPath, setCurrentPath] = useState('/portfolio');
    const [showScreensaver, setShowScreensaver] = useState(false);
    

    const bottomRef = useRef(null);

    const onCommandSubmit = (input) => {
        const trimmed = input.trim();

        // 1. Confirm clear flow
        if (inputMode === 'confirm') {
            if (trimmed.toLowerCase() === 'y' || trimmed.toLowerCase() === 'yes') {
                setHistory([
                    { command: '', output: { type: 'text', content: ['Screen cleared.'] } }
                ]);
            } else {
                setHistory(prev => [
                    ...prev,
                    { command: 'clear --confirm', output: { type: 'text', content: ['Clear cancelled.'] } }
                ]);
            }
            setInputMode('command');
            return;
        }

        // 2. Interactive chat flow
        if (inputMode === 'chat') {
            if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
                setInputMode('command');
                setHistory(prev => [
                    ...prev,
                    { command: input, output: { type: 'text', content: ['Exited interactive chat mode. Back to command shell.'] } }
                ]);
                return;
            }
            
            // Get response from AI client
            const answer = getClaudeResponse(trimmed);
            
            // Log in history
            setHistory(prev => [
                ...prev,
                {
                    command: `chat: ${input}`,
                    output: { type: 'text', content: ['[▓▓▓▓░░░░░] Thinking...'] }
                }
            ]);

            // Simulate AI typewriter response
            setTimeout(() => {
                simulateTypewriter(answer, `chat: ${input}`);
            }, 800);
            return;
        }

        // 3. Password prompt flow
        if (inputMode === 'password') {
            if (trimmed === 'admin') {
                setIsAdmin(true);
                if (pendingCommand) {
                    executeDispatcher(pendingCommand, true);
                } else {
                    setHistory(prev => [
                        ...prev,
                        { command: 'sudo', output: { type: 'text', content: ['Access granted. Administrator session open.'] } }
                    ]);
                }
            } else {
                setHistory(prev => [
                    ...prev,
                    { command: '', output: { type: 'text', content: [formatError('sudo: incorrect password attempt.'), 'Access denied.'] } }
                ]);
            }
            setInputMode('command');
            setPendingCommand(null);
            return;
        }

        // 4. Standard command submission
        if (trimmed === 'sudo') {
            setHistory(prev => [
                ...prev,
                { command: input, output: { type: 'text', content: [] } }
            ]);
            setInputMode('password');
            return;
        }

        // Record in persistent history
        if (trimmed !== '') {
            const updatedHistory = [...sessionHistory, input];
            setSessionHistory(updatedHistory);
            saveHistory(updatedHistory);
        }

        executeDispatcher(input, isAdmin);
    };

    const executeDispatcher = (input, adminState) => {
        const output = handleCommand(input, { 
            isAdmin: adminState, 
            setWallpaper, 
            setIsAdmin, 
            currentPath, 
            history: sessionHistory 
        });

        if (output.type === 'ai-assistant') {
            // Setup thinking progress logs
            setHistory(prev => [
                ...prev,
                {
                    command: input,
                    output: {
                        type: 'text',
                        content: ['🤖 Analyzing query...', '🔍 Retrieval-Augmented vector lookup in progress...']
                    }
                }
            ]);

            setTimeout(() => {
                const answer = getClaudeResponse(output.query);
                simulateTypewriter(answer, input);
            }, 1000);
            return;
        }

        if (output.type === 'github-api') {
            setHistory(prev => [
                ...prev,
                {
                    command: input,
                    output: {
                        type: 'text',
                        content: [
                            '📡 Querying GitHub REST API for @RAZAAli901...',
                            `⚡ Accessing endpoint: /users/RAZAAli901${output.option !== 'user' ? '/' + output.option : ''}`
                        ]
                    }
                }
            ]);

            setTimeout(() => {
                fetchGithubData(output.option).then(data => {
                    let formattedContent = [];
                    
                    if (output.option === 'user') {
                        formattedContent = [
                          ...formatSection(`GITHUB PROFILE: @${data.username}`),
                          `• Name        : ${data.name}`,
                          `• Bio         : ${data.bio}`,
                          `• Public Repos: ${data.publicRepos}`,
                          `• Followers   : ${data.followers}`,
                          `• Location    : ${data.location}`,
                          ''
                        ];
                    } else if (output.option === 'repos') {
                        const headers = ['REPO NAME', 'STARS', 'FORKS', 'PRIMARY LANG'];
                        const rows = data.map(r => [
                          formatSuccess(r.name),
                          r.stars.toString(),
                          r.forks.toString(),
                          formatInfo(r.language)
                        ]);
                        formattedContent = [
                          ...formatSection('TOP GITHUB REPOSITORIES'),
                          ...formatTable(headers, rows),
                          ''
                        ];
                    } else if (output.option === 'stats') {
                        const headers = ['LANGUAGE', 'DISTRIBUTION'];
                        const rows = data.languages.map(l => [
                          formatInfo(l.lang),
                          `${l.percentage}%`
                        ]);
                        formattedContent = [
                          ...formatSection('GITHUB CONTRIBUTION METRICS'),
                          `• Total Stored Repositories: ${data.totalRepos}`,
                          `• Aggregated Stars         : ${data.totalStars}`,
                          '',
                          ...formatTable(headers, rows),
                          ''
                        ];
                    } else if (output.option === 'activity') {
                        const headers = ['REPOSITORY', 'RECENT COMMITS', 'DATE'];
                        const rows = data.map(act => [
                          formatSuccess(act.repo),
                          act.commits.slice(0, 2).join(' | ') || 'Refactoring checkin',
                          act.date
                        ]);
                        formattedContent = [
                          ...formatSection('RECENT GITHUB ACTIVITY'),
                          ...formatTable(headers, rows),
                          ''
                        ];
                    }

                    setHistory(prev => {
                        const nextHist = [...prev];
                        nextHist[nextHist.length - 1] = {
                            command: input,
                            output: { type: 'text', content: formattedContent }
                        };
                        return nextHist;
                    });
                });
            }, 800);
            return;
        }

        if (output.type === 'action') {
            if (output.action === 'clear') {
                if (output.option === 'confirm') {
                    setHistory(prev => [
                        ...prev,
                        { command: input, output: { type: 'text', content: [formatWarning('Are you sure you want to clear the logs? (Y/n)')] } }
                    ]);
                    setInputMode('confirm');
                } else if (output.option === 'keep') {
                    const count = output.count || 5;
                    setHistory(prev => {
                        const kept = prev.slice(-count);
                        return [
                            { command: '', output: { type: 'text', content: ['[Kept previous logs lines]'] } },
                            ...kept
                        ];
                    });
                } else {
                    setHistory([
                        { command: '', output: { type: 'text', content: ['Welcome back. Screen cleared.'] } }
                    ]);
                }
            } else if (output.action === 'theme') {
                if (setTheme) {
                    setTheme(output.theme);
                    setHistory(prev => [...prev, { command: input, output: { type: 'text', content: [formatSuccess(`Theme switched to '${output.theme}'.`)] } }]);
                }
            } else if (output.action === 'cd') {
                setCurrentPath(output.path);
                setHistory(prev => [...prev, { command: input, output: { type: 'text', content: [`Directory changed to: ${output.path}`] } }]);
            } else if (output.action === 'download') {
                triggerDownload(output.file);
                setHistory(prev => [
                    ...prev,
                    {
                        command: input,
                        output: {
                            type: 'text',
                            content: [
                                `💾 Downloading file: ${output.file}...`,
                                formatSuccess(`Download trigger dispatched successfully for ${output.file}.`)
                            ]
                        }
                    }
                ]);
            } else if (output.action === 'matrix') {
                setShowScreensaver(true);
            } else if (output.action === 'chat-interactive') {
                setInputMode('chat');
                setHistory(prev => [
                    ...prev,
                    {
                        command: input,
                        output: {
                            type: 'text',
                            content: [
                                ...formatSection('INTERACTIVE CLAUDE CHAT MODE'),
                                "You are now chatting with Raza's AI assistant.",
                                "Type your question and press Enter. Claude answers authentically in the first person.",
                                "Type 'exit' or 'quit' to return to normal terminal prompt.",
                                ''
                            ]
                        }
                    }
                ]);
            } else if (output.action === 'sudo') {
                if (isAdmin) {
                    setHistory(prev => [...prev, { command: input, output: { type: 'text', content: ['You are already administrator.'] } }]);
                } else {
                    setHistory(prev => [...prev, { command: input, output: { type: 'text', content: ['[sudo] enter administrator password:'] } }]);
                    setInputMode('password');
                    setPendingCommand(output.pendingCommand || null);
                }
            }
        } else {
            setHistory(prev => [...prev, { command: input, output }]);
        }
    };

    const simulateTypewriter = (lines, userCommand) => {
        setIsTyping(true);
        let currentLine = 0;
        let currentChar = 0;
        let tempLines = Array(lines.length).fill('');

        const interval = setInterval(() => {
            if (currentLine >= lines.length) {
                clearInterval(interval);
                setIsTyping(false);
                setHistory(prev => {
                    const next = [...prev];
                    next[next.length - 1] = {
                        command: userCommand,
                        output: { type: 'text', content: lines }
                    };
                    return next;
                });
                return;
            }

            if (currentChar < lines[currentLine].length) {
                tempLines[currentLine] += lines[currentLine][currentChar];
                currentChar++;

                setHistory(prev => {
                    const next = [...prev];
                    next[next.length - 1] = {
                        command: userCommand,
                        output: {
                            type: 'text',
                            content: [...tempLines].filter((_, idx) => idx <= currentLine)
                        }
                    };
                    return next;
                });
            } else {
                currentLine++;
                currentChar = 0;
            }
        }, 12);
    };

    const triggerDownload = (file) => {
        if (file === 'resume.pdf') {
            window.open('https://github.com/RAZAAli901/Interactive-Terminal-Portfoil/raw/main/public/resume.pdf', '_blank');
        } else if (file === 'portfolio.json') {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolioData, null, 2));
            const dlAnchor = document.createElement('a');
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", "portfolio.json");
            dlAnchor.click();
        } else if (file === 'cv.txt') {
            const textLines = [
                `RAZA ALI - AI/ML Engineer`,
                `Location: Lahore, Pakistan`,
                `Email: razaalymurtaza@gmail.com`,
                `-------------------------------`,
                `Experience:`,
                ...portfolioData.experience.map(j => `* ${j.role} @ ${j.company} (${j.period})`),
                `-------------------------------`,
                `Education:`,
                `* ${portfolioData.education.degree} (${portfolioData.education.gradYear})`
            ].join('\n');
            const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(textLines);
            const dlAnchor = document.createElement('a');
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", "cv.txt");
            dlAnchor.click();
        }
    };

    const getWinPath = (path) => {
        if (path === '/') return 'C:\\';
        const parts = path.split('/').filter(p => p !== '');
        return 'C:\\' + parts.join('\\');
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    useEffect(() => {
        if (history.length === 0 && isTyping) {
            let currentLine = 0;
            let currentChar = 0;
            let tempContent = Array(welcomeLines.length).fill('');

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
                    { command: '', output: { type: 'text', content: [...tempContent].filter((_, idx) => idx <= currentLine) } }
                ]);

                if (currentLine < welcomeLines.length) {
                    setTimeout(typeChar, 10);
                } else {
                    setIsTyping(false);
                }
            };
            
            setTimeout(typeChar, 200);
        }
    }, []);

    useEffect(() => {
        if (!isTyping && initialCommand) {
            onCommandSubmit(initialCommand);
            if (setInitialCommand) setInitialCommand(null);
        }
    }, [initialCommand, isTyping]);

    // Run fastfetch once as the landing card after the welcome finishes typing.
    const landedRef = useRef(false);
    useEffect(() => {
        if (!isTyping && !landedRef.current && !initialCommand) {
            landedRef.current = true;
            const output = handleCommand('fastfetch', {
                isAdmin, setWallpaper, setIsAdmin, currentPath, history: sessionHistory,
            });
            setHistory(prev => [...prev, { command: '', output }]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTyping]);

    return (
        <div className={styles.terminalContainer}>
            {showScreensaver && (
                <MatrixScreensaver onClose={() => setShowScreensaver(false)} />
            )}
            <div className={styles.terminalHistory}>
                {history.map((entry, index) => (
                    <div key={index} className={styles.historyEntry}>
                        {entry.command && (
                            <div className={styles.commandLine}>
                                <span className={`${styles.prompt} ${isAdmin ? styles.adminPrompt : ''}`}>
                                    {inputMode === 'chat' 
                                        ? 'RazaAI>' 
                                        : (isAdmin ? 'C:\\Users\\admin>' : `${getWinPath(currentPath)}>`)}
                                </span>
                                <span className={styles.command}>{entry.command}</span>
                            </div>
                        )}
                        <div className={styles.output}>
                            {entry.output.type === 'text' ? (
                                entry.output.content.map((line, i) => {
                                    if (typeof line === 'string') {
                                        // Highlight standard markdown headers
                                        if (line.includes('<span') || line.includes('<strong') || line.includes('<code') || line.includes('<a')) {
                                            return <div key={i} dangerouslySetInnerHTML={{ __html: line }} />;
                                        }
                                        if (line.startsWith('🤖') || line.startsWith('💻') || line.startsWith('💼') || line.startsWith('📧') || line.startsWith('🚀')) {
                                            return <div key={i} className={styles.terminalHeaderLine}>{line}</div>;
                                        }
                                        if (line.startsWith('•')) {
                                            const colonIdx = line.indexOf(':');
                                            if (colonIdx !== -1) {
                                                const label = line.substring(0, colonIdx + 1);
                                                const value = line.substring(colonIdx + 1);
                                                return (
                                                    <div key={i} className={styles.terminalBulletLine}>
                                                        <span className={styles.highlightText}>{label}</span>{value}
                                                    </div>
                                                );
                                            }
                                        }
                                    }
                                    return <div key={i}>{line}</div>;
                                })
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
                    mode={inputMode === 'chat' ? 'command' : inputMode}
                    history={sessionHistory}
                    isAdmin={isAdmin}
                    currentPath={currentPath}
                />
            )}
            <div ref={bottomRef} />
        </div>
    );
}
