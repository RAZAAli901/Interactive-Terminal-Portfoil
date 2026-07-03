import { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css';

export default function Chat() {
    const [activeThread, setActiveThread] = useState('assistant');
    const [inputText, setInputText] = useState('');
    const bottomRef = useRef(null);

    // Initial message threads
    const [threads, setThreads] = useState({
        assistant: {
            name: 'AI Assistant',
            avatar: '🤖',
            lastMsg: 'How can I assist you today?',
            messages: [
                { id: 1, sender: 'them', text: 'Hello! I am your Antigravity portfolio assistant. Ask me about skills, projects, contact details, or terminal commands!', time: '10:00 AM' }
            ]
        },
        recruiter: {
            name: 'Sarah (HR Recruiter)',
            avatar: '👩‍💼',
            lastMsg: 'Would love to discuss potential opportunities!',
            messages: [
                { id: 1, sender: 'them', text: 'Hi Raza! I saw your Windows-style portfolio and was blown away. We are currently looking for a Senior React Engineer. Would you be open to a quick chat this week?', time: '09:15 AM' }
            ]
        },
        techlead: {
            name: 'Marcus (Tech Lead)',
            avatar: '👨‍💻',
            lastMsg: 'Great job refactoring the window components!',
            messages: [
                { id: 1, sender: 'them', text: 'Hey Raza, the new dynamic window management PR looks super clean. Excellent work fixing that z-index stacking bug!', time: 'Yesterday' }
            ]
        }
    });

    const activeMessages = threads[activeThread].messages;

    const handleSend = (e) => {
        e.preventDefault();
        if (inputText.trim() === '') return;

        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = {
            id: Date.now(),
            sender: 'me',
            text: inputText,
            time: timeString
        };

        // Append user message
        const updatedMessages = [...threads[activeThread].messages, userMsg];
        
        setThreads(prev => ({
            ...prev,
            [activeThread]: {
                ...prev[activeThread],
                lastMsg: inputText,
                messages: updatedMessages
            }
        }));

        const text = inputText;
        setInputText('');

        // Trigger dynamic response after a small delay
        setTimeout(() => {
            let replyText = '';
            if (activeThread === 'assistant') {
                const lowerText = text.toLowerCase();
                if (lowerText.includes('hello') || lowerText.includes('hi')) {
                    replyText = "Hello there! Try asking me about 'skills', 'projects', 'resume' or 'terminal'!";
                } else if (lowerText.includes('skill')) {
                    replyText = "Raza specializes in: React, JavaScript, HTML5/CSS3, Node.js, Express, TailwindCSS, Git, and REST APIs. He loves building highly interactive web dashboards!";
                } else if (lowerText.includes('project')) {
                    replyText = "Raza has built some awesome projects: this interactive Windows Portfolio, a Card Memory game, a fully functional MineSweeper, and a retro Terminal. Use the start menu to explore them all!";
                } else if (lowerText.includes('command') || lowerText.includes('terminal')) {
                    replyText = "Open the Command Prompt window! Sudo password is 'admin'. Commands include: about, projects, contact, fastfetch, clear, sudo, and wallpaper [1-12].";
                } else if (lowerText.includes('contact') || lowerText.includes('email')) {
                    replyText = "You can contact Raza at raza@example.com or find him on GitHub and LinkedIn. Links are available in the Web Browser bookmarks!";
                } else {
                    replyText = "That's interesting! I'm just an assistant, but you can read more details in Notepad, or email Raza directly to chat about collaborations.";
                }
            } else if (activeThread === 'recruiter') {
                replyText = "Fantastic! I've sent a Calendar invite to your email for a 15-minute introductory call tomorrow at 2:00 PM. Looking forward to speaking with you!";
            } else if (activeThread === 'techlead') {
                replyText = "Haha, indeed! Remember: there are two ways to write error-free programs; only the third one works. Keep up the clean code!";
            }

            const replyMsg = {
                id: Date.now() + 1,
                sender: 'them',
                text: replyText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setThreads(prev => ({
                ...prev,
                [activeThread]: {
                    ...prev[activeThread],
                    lastMsg: replyText,
                    messages: [...prev[activeThread].messages, replyMsg]
                }
            }));
        }, 1000);
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeMessages]);

    return (
        <div className={styles.chatContainer}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarTitle}>Chats</div>
                <div className={styles.threadList}>
                    {Object.entries(threads).map(([key, thread]) => (
                        <div 
                            key={key}
                            className={`${styles.threadItem} ${activeThread === key ? styles.threadActive : ''}`}
                            onClick={() => setActiveThread(key)}
                        >
                            <div className={styles.avatar}>{thread.avatar}</div>
                            <div className={styles.threadDetails}>
                                <div className={styles.threadName}>{thread.name}</div>
                                <div className={styles.threadLastMsg}>{thread.lastMsg}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={styles.chatWindow}>
                <div className={styles.chatHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{threads[activeThread].avatar} {threads[activeThread].name}</span>
                    <button 
                        onClick={() => {
                            const formatted = activeMessages.map(m => `[${m.time}] ${m.sender === 'me' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
                            const blob = new Blob([formatted], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${activeThread}_transcript.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        style={{ background: '#0078d4', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                    >
                        💾 Export Chat
                    </button>
                </div>
                <div className={styles.messageArea}>
                    {activeMessages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`${styles.messageRow} ${msg.sender === 'me' ? styles.sent : styles.received}`}
                        >
                            <div className={styles.bubble}>{msg.text}</div>
                            <div className={styles.msgMeta}>{msg.time}</div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
                <div style={{ display: 'flex', gap: '8px', padding: '6px 12px', background: '#1c1c1c', borderTop: '1px solid #333', flexWrap: 'wrap' }}>
                    {['skills', 'projects', 'commands', 'contact'].map(term => (
                        <button 
                            key={term}
                            type="button"
                            onClick={() => {
                                setInputText(term);
                            }}
                            style={{ background: '#2b2b2b', color: '#0078d4', border: '1px solid #444', borderRadius: '12px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
                        >
                            Ask about "{term}"
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSend} className={styles.inputArea}>
                    <input 
                        type="text" 
                        className={styles.input} 
                        placeholder="Type a message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                    <button type="submit" className={styles.sendBtn}>➔</button>
                </form>
            </div>
        </div>
    );
}
