import { useState } from 'react';
import { useTheme } from '../theme/themeContext';
import { THEME_LIST } from '../theme/themes';
import styles from './Settings.module.css';

export default function Settings({ setWallpaper, currentWallpaper }) {
    const [activeSection, setActiveSection] = useState('system');
    const { themeId, setTheme } = useTheme();

    const wallpapers = [
        { id: 1, name: 'Glitch/Broken', url: 'https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?q=80&w=2073&auto=format&fit=crop' },
        { id: 2, name: 'Cyberpunk', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2070&auto=format&fit=crop' },
        { id: 3, name: 'Vaporwave', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop' },
        { id: 4, name: 'Nebula', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop' },
        { id: 5, name: 'Matrix', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop' },
        { id: 6, name: 'Yosemite', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop' },
        { id: 7, name: 'Pacific', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop' },
        { id: 8, name: 'Everest', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop' }
    ];

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
                                <span className={styles.specLabel}>Performance Mode</span>
                                <span className={styles.specValue}>
                                    <select style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '2px 4px', borderRadius: '3px', fontSize: '12px' }}>
                                        <option>Best Power Efficiency</option>
                                        <option>Balanced Mode</option>
                                        <option>Best Performance</option>
                                    </select>
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
                        <p style={{ fontSize: '14px', color: '#ccc' }}>Select an image to update the desktop background:</p>
                        <div className={styles.wallpaperGrid}>
                            {wallpapers.map((wp) => (
                                <div 
                                    key={wp.id}
                                    className={`${styles.wallpaperThumb} ${currentWallpaper === wp.id ? styles.activeWallpaper : ''}`}
                                    style={{ backgroundImage: `url(${wp.url})` }}
                                    onClick={() => setWallpaper(wp.id)}
                                >
                                    <div className={styles.wpLabel}>{wp.name}</div>
                                </div>
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
