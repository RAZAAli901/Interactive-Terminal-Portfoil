import { useState, useEffect } from 'react';
import { fileSystem } from '../utils/fileSystem';
import styles from './ExplorerWindow.module.css';

export default function ExplorerWindow() {
    const [currentPath, setCurrentPath] = useState([fileSystem]);
    const [activeProject, setActiveProject] = useState(null);
    const [screenshotIdx, setScreenshotIdx] = useState(0);

    useEffect(() => {
        setScreenshotIdx(0);
    }, [activeProject]);

    const currentFolder = currentPath[currentPath.length - 1];

    const handleDoubleClick = (item) => {
        if (item.type === 'folder' || item.type === 'drive') {
            setCurrentPath([...currentPath, item]);
        } else if (item.type === 'project') {
            import('../utils/portfolioData').then(({ projectsData }) => {
                const proj = projectsData.find(p => p.id === item.projectId);
                if (proj) {
                    setActiveProject(proj);
                }
            });
        } else {
            alert(`Opening file: ${item.name}`);
        }
    };

    const handleBack = () => {
        if (activeProject) {
            setActiveProject(null);
        } else if (currentPath.length > 1) {
            setCurrentPath(currentPath.slice(0, -1));
        }
    };

    // Custom folder icon using CSS/Unicode if needed, or just emoji
    const FolderIcon = () => <span style={{ color: '#f1c40f', fontSize: '2rem' }}>📁</span>;
    const DriveIcon = () => <span style={{ fontSize: '2rem' }}>💿</span>;
    const FileIcon = () => <span style={{ fontSize: '2rem' }}>📄</span>;
    const ProjectIcon = () => <span style={{ fontSize: '2rem' }}>🚀</span>;

    return (
        <div className={styles.explorerWindow}>
            <div className={styles.explorerToolbar}>
                <button className={styles.navBtn} onClick={handleBack} disabled={currentPath.length <= 1}>⬅</button>
                <button className={styles.navBtn}>➡</button>
                <div className={styles.addressBar}>
                    {currentPath.map(p => p.name).join(' > ')}
                </div>
            </div>
            <div className={styles.explorerContent}>
                <div className={styles.explorerSidebar}>
                    <div className={styles.sidebarItem}>🏠 Home</div>
                    <div className={styles.sidebarItem}>Desktop</div>
                    <div className={styles.sidebarItem}>Downloads</div>
                    <div className={styles.sidebarItem}>Documents</div>
                    <div style={{ margin: '10px 0', borderBottom: '1px solid var(--hypr-border, #45475a)' }}></div>
                    <div className={styles.sidebarItem}>💾 File System (/)</div>
                </div>
                <div className={styles.explorerMain}>
                    {activeProject ? (
                        <div className={styles.projectDetails}>
                            <div className={styles.backLink} onClick={() => setActiveProject(null)}>
                                ⬅ Back to Projects
                            </div>
                            <h3 className={styles.projectTitle}>{activeProject.title}</h3>
                            
                            {activeProject.screenshots && activeProject.screenshots.length > 0 && (
                                <div className={styles.carouselContainer}>
                                    <button 
                                        className={styles.carouselBtn} 
                                        onClick={() => setScreenshotIdx(prev => (prev === 0 ? activeProject.screenshots.length - 1 : prev - 1))}
                                    >
                                        ◀
                                    </button>
                                    <div className={styles.carouselImageWrapper}>
                                        <img 
                                            src={activeProject.screenshots[screenshotIdx]} 
                                            alt={`${activeProject.title} screenshot`}
                                            className={styles.carouselImage}
                                        />
                                    </div>
                                    <button 
                                        className={styles.carouselBtn} 
                                        onClick={() => setScreenshotIdx(prev => (prev === activeProject.screenshots.length - 1 ? 0 : prev + 1))}
                                    >
                                        ▶
                                    </button>
                                </div>
                            )}
                            
                            <p className={styles.projectDescription}>{activeProject.description}</p>
                            
                            {/* Tech Stack Badges */}
                            {activeProject.tech && (
                                <div className={styles.techBadgesContainer}>
                                    {activeProject.tech.map(t => (
                                        <span key={t} className={styles.techBadge}>{t}</span>
                                    ))}
                                </div>
                            )}

                            {/* Project Links */}
                            <div className={styles.projectLinks}>
                                {activeProject.liveLink && (
                                    <a 
                                        href={activeProject.liveLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={styles.projectLinkBtn}
                                    >
                                        🌐 Live Demo
                                    </a>
                                )}
                                {activeProject.repoLink && (
                                    <a 
                                        href={activeProject.repoLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={styles.projectLinkBtn}
                                    >
                                        💻 View Source
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : currentFolder.children && currentFolder.children.length > 0 ? (
                        currentFolder.children.map((item, index) => (
                            <div
                                key={index}
                                className={styles.fileItem}
                                onDoubleClick={() => handleDoubleClick(item)}
                            >
                                <div className={styles.fileIcon}>
                                    {item.type === 'folder' ? <FolderIcon /> :
                                        item.type === 'drive' ? <DriveIcon /> : 
                                        item.type === 'project' ? <ProjectIcon /> : <FileIcon />}
                                </div>
                                <div className={styles.fileName}>{item.name}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '20px', color: '#888' }}>This folder is empty.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
