import { useState } from 'react';
import styles from './Store.module.css';

export default function Store({ installedApps = {}, onInstallApp, onOpenApp }) {
    const [activeTab, setActiveTab] = useState('all');
    const [downloading, setDownloading] = useState({}); // { appId: progress }

    const apps = [
        {
            id: 'vscode',
            name: 'Visual Studio Code',
            icon: '💙',
            desc: 'A powerful, sleek code editor mockup showing code files for this portfolio.',
            category: 'apps'
        },
        {
            id: 'minesweeper',
            name: 'MineSweeper Pro',
            icon: '💣',
            desc: 'A fully playable classic MineSweeper game. Flag mines and clear the grid!',
            category: 'games'
        }
    ];

    const handleInstall = (appId) => {
        if (installedApps[appId]) {
            if (onOpenApp) onOpenApp(appId);
            return;
        }
        if (downloading[appId] !== undefined) return;

        // Simulate progress bar
        setDownloading(prev => ({ ...prev, [appId]: 0 }));
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 10;
            setDownloading(prev => ({ ...prev, [appId]: currentProgress }));
            if (currentProgress >= 100) {
                clearInterval(interval);
                onInstallApp(appId);
                setDownloading(prev => {
                    const next = { ...prev };
                    delete next[appId];
                    return next;
                });
            }
        }, 300);
    };

    const filteredApps = activeTab === 'all' 
        ? apps 
        : apps.filter(app => app.category === activeTab);

    return (
        <div className={styles.storeContainer}>
            <div className={styles.header}>
                <div className={styles.logo}>🛍️ Microsoft Store</div>
                <div className={styles.tabs}>
                    <div className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`} onClick={() => setActiveTab('all')}>Home</div>
                    <div className={`${styles.tab} ${activeTab === 'apps' ? styles.activeTab : ''}`} onClick={() => setActiveTab('apps')}>Apps</div>
                    <div className={`${styles.tab} ${activeTab === 'games' ? styles.activeTab : ''}`} onClick={() => setActiveTab('games')}>Games</div>
                </div>
            </div>

            <div className={styles.content}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Top Applications & Games</h2>
                <div className={styles.catalogGrid}>
                    {filteredApps.map((app) => {
                        const isInstalled = installedApps[app.id];
                        const progress = downloading[app.id];
                        const isDownloading = progress !== undefined;

                        return (
                            <div key={app.id} className={styles.appCard}>
                                <div className={styles.appIcon}>{app.icon}</div>
                                <div className={styles.appName}>{app.name}</div>
                                <div className={styles.appDesc}>{app.desc}</div>
                                <div style={{ fontSize: '12px', color: '#ffaa00', margin: '4px 0', userSelect: 'none' }}>
                                    ★★★★★ <span style={{ color: '#8c92ac' }}>(4.9/5)</span>
                                </div>
                                
                                {isDownloading ? (
                                    <div style={{ width: '100%' }}>
                                        <div style={{ fontSize: '11px', color: '#8c92ac' }}>Downloading... {progress}%</div>
                                        <div className={styles.progressContainer}>
                                            <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        className={`${styles.btn} ${isInstalled ? styles.installedBtn : ''}`}
                                        onClick={() => handleInstall(app.id)}
                                    >
                                        {isInstalled ? 'Open App' : 'Get'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
