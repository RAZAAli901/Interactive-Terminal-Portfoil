import { useState } from 'react';
import { useTheme } from '../theme/themeContext';
import { THEME_LIST } from '../theme/themes';
import { getPerf, setPerf } from '../theme/perf';
import { WALLPAPERS, wallpaperUrl } from '../data/wallpapers';
import styles from './Settings.module.css';

export default function Settings({ setWallpaper, currentWallpaper }) {
    const [activeSection, setActiveSection] = useState('system');
    const { themeId, setTheme } = useTheme();
    const [lowPower, setLowPower] = useState(() => getPerf() === 'low');

    const toggleLowPower = () => {
        setLowPower((on) => {
            const next = !on;
            setPerf(next ? 'low' : 'normal');
            return next;
        });
    };

    // The twenty bundled rice wallpapers (see src/data/wallpapers.js).
    const wallpapers = WALLPAPERS;

    return (
        <div className={styles.settingsContainer}>
            <div className={styles.sidebar}>
                <div 
                    className={`${styles.sidebarItem} ${activeSection === 'system' ? styles.sidebarItemActive : ''}`} 
                    onClick={() => setActiveSection('system')}
                >
                    🖥️ System
                </div>
                <div 
                    className={`${styles.sidebarItem} ${activeSection === 'personalization' ? styles.sidebarItemActive : ''}`} 
                    onClick={() => setActiveSection('personalization')}
                >
                    🎨 Personalization
                </div>
                <div 
                    className={`${styles.sidebarItem} ${activeSection === 'about' ? styles.sidebarItemActive : ''}`} 
                    onClick={() => setActiveSection('about')}
                >
                    ℹ️ About
                </div>
            </div>

            <div className={styles.content}>
                {activeSection === 'system' && (
                    <div>
                        <div className={styles.title}>System Information</div>
                        <div className={styles.systemSpecs}>
                            <div className={styles.specRow}>
                                <span className={styles.specLabel}>Hostname</span>
                                <span className={styles.specValue}>razaali@arch</span>
                            </div>
                            <div className={styles.specRow}>
                                <span className={styles.specLabel}>Kernel</span>
                                <span className={styles.specValue}>Linux 6.9.7-arch1-1</span>
                            </div>
                            <div className={styles.specRow}>
                                <span className={styles.specLabel}>Window Manager</span>
                                <span className={styles.specValue}>Hyprland (Wayland)</span>
                            </div>
                            <div className={styles.specRow}>
                                <span className={styles.specLabel}>Processor</span>
                                <span className={styles.specValue}>AMD Ryzen 9 5900X @ 4.20 GHz</span>
                            </div>
                            <div className={styles.specRow}>
                                <span className={styles.specLabel}>Installed RAM</span>
                                <span className={styles.specValue}>64.0 GB (58.2 GB usable)</span>
                            </div>
                            <div className={styles.specRow}>
                                <span className={styles.specLabel}>System Type</span>
                                <span className={styles.specValue}>64-bit OS, x64-based processor</span>
                            </div>
                            <div className={styles.specRow}>
                                <span className={styles.specLabel}>Distro</span>
                                <span className={styles.specValue}>Arch Linux (rolling)</span>
                            </div>
                            <div className={styles.specRow}>
                                <span className={styles.specLabel}>Power Battery Status</span>
                                <span className={styles.specValue}>🔋 87% (Plugged in, charging)</span>
                            </div>
                            <div className={styles.specRow}>
                                <span className={styles.specLabel}>Low-power mode</span>
                                <span className={styles.specValue}>
                                    <button
                                        onClick={toggleLowPower}
                                        aria-pressed={lowPower}
                                        style={{
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            padding: '4px 12px',
                                            borderRadius: '999px',
                                            border: `1px solid ${lowPower ? 'var(--hypr-green, #a6e3a1)' : 'var(--hypr-border, #45475a)'}`,
                                            background: lowPower ? 'color-mix(in srgb, var(--hypr-green, #a6e3a1) 22%, transparent)' : 'transparent',
                                            color: 'var(--hypr-text, #eee)',
                                        }}
                                    >
                                        {lowPower ? 'On — blur & animations off' : 'Off'}
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'personalization' && (
                    <div>
                        <div className={styles.title}>Colorscheme</div>
                        <p style={{ fontSize: '14px', color: 'var(--hypr-subtext, #ccc)' }}>Switch the Hyprland palette (also available as <code>theme &lt;name&gt;</code> in the terminal):</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '10px 0 24px' }}>
                            {THEME_LIST.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    style={{
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        padding: '7px 14px',
                                        borderRadius: '999px',
                                        border: `1px solid ${themeId === t.id ? 'var(--hypr-accent, #cba6f7)' : 'var(--hypr-border, #45475a)'}`,
                                        background: themeId === t.id ? 'color-mix(in srgb, var(--hypr-accent, #cba6f7) 22%, transparent)' : 'transparent',
                                        color: 'var(--hypr-text, #eee)',
                                    }}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div className={styles.title}>Desktop Wallpaper</div>
                        <p style={{ fontSize: '14px', color: 'var(--hypr-subtext, #ccc)' }}>
                            Twenty bundled rice wallpapers — also settable from the terminal with <code>wallpaper &lt;name&gt;</code>:
                        </p>
                        <div className={styles.wallpaperGrid}>
                            {wallpapers.map((wp) => (
                                <button
                                    key={wp.id}
                                    type="button"
                                    aria-label={`${wp.name} — ${wp.palette}`}
                                    aria-pressed={currentWallpaper === wp.id}
                                    className={`${styles.wallpaperThumb} ${currentWallpaper === wp.id ? styles.activeWallpaper : ''}`}
                                    style={{ backgroundImage: `url(${wallpaperUrl(wp.id)})` }}
                                    onClick={() => setWallpaper(wp.id)}
                                >
                                    <span className={styles.wpLabel}>{wp.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'about' && (
                    <div>
                        <div className={styles.title}>About This Portfolio</div>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#ddd' }}>
                            An Arch Linux + Hyprland desktop recreated in the browser with React and Vite — dwindle tiling, a waybar, a wofi launcher, five workspaces, a full boot sequence, and a kitty terminal shell.
                        </p>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#ddd', marginTop: '15px' }}>
                            Created with 💻 and ☕ by a passionate Full-Stack Developer. Use the terminal, run <code>help</code>, or browse the system files to explore!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
