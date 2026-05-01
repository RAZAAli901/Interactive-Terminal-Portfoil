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
                    {/* Pinned Apps (Mock) */}
                    <div className={`${styles.taskbarItem} mock`} title="Chat"><span className={styles.taskbarIcon}>💬</span></div>
                    <div className={`${styles.taskbarItem} mock`} title="File Explorer"><span className={styles.taskbarIcon}>📁</span></div>
                    <div className={`${styles.taskbarItem} mock`} title="Browser"><span className={styles.taskbarIcon}>🌐</span></div>

                    {windows.map((window) => (
                        <div
                            key={window.id}
                            className={`${styles.taskbarItem} ${window.isOpen && !window.isMinimized ? styles.focused : ''}`}
                            onClick={() => onToggleWindow(window.id)}
                            title={window.title}
                        >
                            <span className={styles.taskbarIcon}>{window.id === 'terminal' ? '💻' : window.id === 'notepad' ? '📝' : '📁'}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.systemTray}>
                <div className={styles.trayIcon} title="Weather">☁️ 19°C</div>
                <div className={styles.trayIcon} title="Language">ENG</div>
                <div className={styles.trayIcon} title="Network, Volume, Battery">📶 🔊 🔋</div>
                <div className={styles.trayClock} title={time.toLocaleDateString()}>
                    <div>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                    <div>{time.toLocaleDateString()}</div>
                </div>
            </div>
        </div>
    );
}
