import React from 'react';
import styles from './StartMenu.module.css';

export default function StartMenu({ isOpen, onAppClick }) {
    if (!isOpen) return null;

    return (
        <div className={styles.startMenu}>
            <div className={styles.startMenuHeader}>
                <div className={styles.searchBox}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input type="text" placeholder="Search for apps, settings, and documents" />
                </div>
            </div>

            <div className={styles.pinnedSection}>
                <div className={styles.sectionTitle}>
                    <span>Pinned</span>
                    <button className={styles.allAppsBtn}>All apps &gt;</button>
                </div>
                <div className={styles.appsGrid}>
                    <div className={styles.appItem} onClick={() => onAppClick('browser')}>
                        <span className={styles.appIcon}>🌐</span>
                        <span className={styles.appName}>Edge</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('word')}>
                        <span className={styles.appIcon}>📝</span>
                        <span className={styles.appName}>Word</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('excel')}>
                        <span className={styles.appIcon}>📊</span>
                        <span className={styles.appName}>Excel</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('powerpoint')}>
                        <span className={styles.appIcon}>🔴</span>
                        <span className={styles.appName}>PowerPoint</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('outlook')}>
                        <span className={styles.appIcon}>📧</span>
                        <span className={styles.appName}>Outlook</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('store')}>
                        <span className={styles.appIcon}>🛍️</span>
                        <span className={styles.appName}>Microsoft Store</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('settings')}>
                        <span className={styles.appIcon}>⚙️</span>
                        <span className={styles.appName}>Settings</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('photos')}>
                        <span className={styles.appIcon}>🖼️</span>
                        <span className={styles.appName}>Photos</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('solitaire')}>
                        <span className={styles.appIcon}>🃏</span>
                        <span className={styles.appName}>Solitaire & Casual Games</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('calculator')}>
                        <span className={styles.appIcon}>🧮</span>
                        <span className={styles.appName}>Calculator</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('clock')}>
                        <span className={styles.appIcon}>⏰</span>
                        <span className={styles.appName}>Clock</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('notepad')}>
                        <span className={styles.appIcon}>🗒️</span>
                        <span className={styles.appName}>Notepad</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('snipping')}>
                        <span className={styles.appIcon}>✂️</span>
                        <span className={styles.appName}>Snipping Tool</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('onenote')}>
                        <span className={styles.appIcon}>📓</span>
                        <span className={styles.appName}>OneNote</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('explorer')}>
                        <span className={styles.appIcon}>📁</span>
                        <span className={styles.appName}>File Explorer</span>
                    </div>
                    <div className={styles.appItem} onClick={() => onAppClick('browser')}>
                        <span className={styles.appIcon}>🔵</span>
                        <span className={styles.appName}>Google Chrome</span>
                    </div>
                </div>
            </div>

            <div className={styles.recommendedSection}>
                <div className={styles.sectionTitle}>
                    <span>Recommended</span>
                    <button className={styles.allAppsBtn}>More &gt;</button>
                </div>
                <div className={styles.recommendedGrid}>
                    <div className={styles.recommendedItem}>
                        <span className={styles.recIcon}>🔵</span>
                        <div className={styles.recDetails}>
                            <span className={styles.recName}>Uninstall Zoom Workplace</span>
                            <span className={styles.recTime}>Recently added</span>
                        </div>
                    </div>
                    <div className={styles.recommendedItem}>
                        <span className={styles.recIcon}>🚀</span>
                        <div className={styles.recDetails}>
                            <span className={styles.recName}>Antigravity</span>
                            <span className={styles.recTime}>Frequently used app</span>
                        </div>
                    </div>
                    <div className={styles.recommendedItem}>
                        <span className={styles.recIcon}>📄</span>
                        <div className={styles.recDetails}>
                            <span className={styles.recName}>Screenshot (218)</span>
                            <span className={styles.recTime}>21h ago</span>
                        </div>
                    </div>
                    <div className={styles.recommendedItem}>
                        <span className={styles.recIcon}>📁</span>
                        <div className={styles.recDetails}>
                            <span className={styles.recName}>Diablo</span>
                            <span className={styles.recTime}>21h ago</span>
                        </div>
                    </div>
                    <div className={styles.recommendedItem}>
                        <span className={styles.recIcon}>📄</span>
                        <div className={styles.recDetails}>
                            <span className={styles.recName}>Screenshot (217)</span>
                            <span className={styles.recTime}>23h ago</span>
                        </div>
                    </div>
                    <div className={styles.recommendedItem}>
                        <span className={styles.recIcon}>📄</span>
                        <div className={styles.recDetails}>
                            <span className={styles.recName}>textbasedgame.cpp</span>
                            <span className={styles.recTime}>23h ago</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.startMenuFooter}>
                <div className={styles.userProfile}>
                    <div className={styles.userAvatar}>👤</div>
                    <div className={styles.userName}>lenovo</div>
                </div>
                <button className={styles.powerBtn} onClick={() => window.location.reload()}>
                    ⏻
                </button>
            </div>
        </div>
    );
}
