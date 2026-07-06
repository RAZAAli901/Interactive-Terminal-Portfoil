import { useState, useEffect } from 'react';
import styles from './Taskbar.module.css';

export default function Taskbar({ windows, onToggleWindow, onToggleStartMenu, isStartMenuOpen }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <nav className={styles.taskbar} aria-label="Taskbar">
            <div className={styles.taskbarCenter}>
                <button
                    className={`${styles.startButton} start-button ${isStartMenuOpen ? styles.active : ''}`}
                    onClick={onToggleStartMenu}
                    aria-label={isStartMenuOpen ? 'Close Start menu' : 'Open Start menu'}
                    aria-expanded={isStartMenuOpen}
                >
                    <div className={styles.win11Logo}>
                        <div></div><div></div><div></div><div></div>
                    </div>
                </button>

                <div className={styles.taskbarSearch} role="search">
                    <span className={styles.searchIcon} aria-hidden="true">🔍</span>
                    <input type="text" placeholder="Search" readOnly aria-label="Search (decorative)" />
                </div>

                <div className={styles.taskbarApps} role="toolbar" aria-label="Open windows and pinned apps">
                    {/* Pinned Apps */}
                    <div
                        className={styles.taskbarItem}
                        title="Chat"
                        role="button"
                        tabIndex={0}
                        aria-label="Chat"
                        onClick={() => onToggleWindow('chat')}
                        onKeyDown={(e) => e.key === 'Enter' && onToggleWindow('chat')}
                    >
                        <span className={styles.taskbarIcon} aria-hidden="true">💬</span>
                    </div>
                    <div
                        className={styles.taskbarItem}
                        title="File Explorer"
                        role="button"
                        tabIndex={0}
                        aria-label="File Explorer"
                        onClick={() => onToggleWindow('explorer')}
                        onKeyDown={(e) => e.key === 'Enter' && onToggleWindow('explorer')}
                    >
                        <span className={styles.taskbarIcon} aria-hidden="true">📁</span>
                    </div>
                    <div
                        className={styles.taskbarItem}
                        title="Web Browser"
                        role="button"
                        tabIndex={0}
                        aria-label="Web Browser"
                        onClick={() => onToggleWindow('browser')}
                        onKeyDown={(e) => e.key === 'Enter' && onToggleWindow('browser')}
                    >
                        <span className={styles.taskbarIcon} aria-hidden="true">🌐</span>
                    </div>

                    {windows.map((window) => (
                        <div
                            key={window.id}
                            className={`${styles.taskbarItem} ${window.isOpen && !window.isMinimized ? styles.focused : ''}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => onToggleWindow(window.id)}
                            onKeyDown={(e) => e.key === 'Enter' && onToggleWindow(window.id)}
                            title={window.title}
                            aria-label={window.title}
                            aria-pressed={window.isOpen && !window.isMinimized}
                        >
                            <span className={styles.taskbarIcon} aria-hidden="true">{window.icon || '🖥️'}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.systemTray} aria-label="System tray">
                <div className={styles.trayIcon} title="Weather" aria-label="Weather: 19°C">☁️ 19°C</div>
                <div className={styles.trayIcon} title="Language" aria-label="Language: ENG">ENG</div>
                <div className={styles.trayIcon} title="Network, Volume, Battery" aria-label="Network, Volume, Battery">📶 🔊 🔋</div>
                <div className={styles.trayClock} title={time.toLocaleDateString()} aria-label={`Time: ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}, Date: ${time.toLocaleDateString()}`}>
                    <div className={styles.clockTime}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</div>
                    <div className={styles.clockDate}>{time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
            </div>
        </nav>
    );
}
