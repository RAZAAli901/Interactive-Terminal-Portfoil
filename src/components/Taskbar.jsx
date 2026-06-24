import { useState, useEffect } from 'react';
import styles from './Taskbar.module.css';

export default function Taskbar({ windows, onToggleWindow, onToggleStartMenu, isStartMenuOpen }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.taskbar}>
            <div className={styles.taskbarCenter}>
                <div className={`${styles.startButton} start-button ${isStartMenuOpen ? styles.active : ''}`} onClick={onToggleStartMenu}>
                    <div className={styles.win11Logo}>
                        <div></div><div></div><div></div><div></div>
                    </div>
                </div>

                <div className={styles.taskbarSearch}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input type="text" placeholder="Search" readOnly />
                </div>

                <div className={styles.taskbarApps}>
                    {/* Pinned Apps */}
                    <div className={styles.taskbarItem} title="Chat" onClick={() => onToggleWindow('chat')}><span className={styles.taskbarIcon}>💬</span></div>
                    <div className={styles.taskbarItem} title="File Explorer" onClick={() => onToggleWindow('explorer')}><span className={styles.taskbarIcon}>📁</span></div>
                    <div className={styles.taskbarItem} title="Web Browser" onClick={() => onToggleWindow('browser')}><span className={styles.taskbarIcon}>🌐</span></div>

                    {windows.map((window) => (
                        <div
                            key={window.id}
                            className={`${styles.taskbarItem} ${window.isOpen && !window.isMinimized ? styles.focused : ''}`}
                            onClick={() => onToggleWindow(window.id)}
                            title={window.title}
                        >
                            <span className={styles.taskbarIcon}>{window.icon || '🖥️'}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.systemTray}>
                <div className={styles.trayIcon} title="Weather">☁️ 19°C</div>
                <div className={styles.trayIcon} title="Language">ENG</div>
                <div className={styles.trayIcon} title="Network, Volume, Battery">📶 🔊 🔋</div>
                <div className={styles.trayClock} title={time.toLocaleDateString()}>
                    <div className={styles.clockTime}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</div>
                    <div className={styles.clockDate}>{time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
            </div>
        </div>
    );
}
