import { useState, useEffect } from 'react';

export default function Taskbar({ windows, onToggleWindow, onToggleStartMenu, isStartMenuOpen }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="taskbar">
            <div className="taskbar-left">
                <div className={`start-button ${isStartMenuOpen ? 'active' : ''}`} onClick={onToggleStartMenu}>
                    <div className="win11-logo">
                        <div></div><div></div><div></div><div></div>
                    </div>
                </div>
                <div className="taskbar-search">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search" readOnly />
                </div>
                <div className="taskbar-apps">
                    {windows.map((window) => (
                        <div
                            key={window.id}
                            className={`taskbar-item ${window.isOpen && !window.isMinimized ? 'focused' : ''}`}
                            onClick={() => onToggleWindow(window.id)}
                            title={window.title}
                        >
                            <span className="taskbar-icon">{window.id === 'terminal' ? '💻' : '📁'}</span>
                        </div>
                    ))}
                    {/* Mock Icons for aesthetic */}
                    <div className="taskbar-item mock" title="Chat"><span className="taskbar-icon">💬</span></div>
                    <div className="taskbar-item mock" title="Browser"><span className="taskbar-icon">🌐</span></div>
                </div>
            </div>

            <div className="system-tray">
                <div className="tray-icon">☁️ 19°C</div>
                <div className="tray-icon">ENG</div>
                <div className="tray-icon">📶 🔊 🔋</div>
                <div className="tray-clock">
                    <div>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div>{time.toLocaleDateString()}</div>
                </div>
            </div>
        </div>
    );
}
