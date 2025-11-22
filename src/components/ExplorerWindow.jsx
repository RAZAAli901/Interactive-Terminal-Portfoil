import { useState } from 'react';
import { fileSystem } from '../utils/fileSystem';

export default function ExplorerWindow() {
    const [currentPath, setCurrentPath] = useState([fileSystem]);

    const currentFolder = currentPath[currentPath.length - 1];

    const handleDoubleClick = (item) => {
        if (item.type === 'folder' || item.type === 'drive') {
            setCurrentPath([...currentPath, item]);
        } else {
            alert(`Opening file: ${item.name}`);
        }
    };

    const handleBack = () => {
        if (currentPath.length > 1) {
            setCurrentPath(currentPath.slice(0, -1));
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'drive': return '💿';
            case 'folder': return 'qh'; // Using text/emoji for folder
            case 'file': return '📄';
            default: return '❓';
        }
    };

    // Custom folder icon using CSS/Unicode if needed, or just emoji
    const FolderIcon = () => <span style={{ color: '#f1c40f', fontSize: '2rem' }}>📁</span>;
    const DriveIcon = () => <span style={{ fontSize: '2rem' }}>💿</span>;
    const FileIcon = () => <span style={{ fontSize: '2rem' }}>📄</span>;

    return (
        <div className="explorer-window">
            <div className="explorer-toolbar">
                <button onClick={handleBack} disabled={currentPath.length <= 1}>⬅</button>
                <button>➡</button>
                <div className="address-bar">
                    {currentPath.map(p => p.name).join(' > ')}
                </div>
                <div className="search-bar">
                    Search {currentFolder.name}
                </div>
            </div>
            <div className="explorer-body">
                <div className="explorer-sidebar">
                    <div className="sidebar-group">
                        <div className="sidebar-header">Favorites</div>
                        <div className="sidebar-item">Desktop</div>
                        <div className="sidebar-item">Downloads</div>
                        <div className="sidebar-item">Recent Places</div>
                    </div>
                    <div className="sidebar-group">
                        <div className="sidebar-header">Computer</div>
                        <div className="sidebar-item">Local Disk (C:)</div>
                    </div>
                </div>
                <div className="explorer-content">
                    {currentFolder.children && currentFolder.children.length > 0 ? (
                        currentFolder.children.map((item, index) => (
                            <div
                                key={index}
                                className="explorer-item"
                                onDoubleClick={() => handleDoubleClick(item)}
                            >
                                <div className="item-icon">
                                    {item.type === 'folder' ? <FolderIcon /> :
                                        item.type === 'drive' ? <DriveIcon /> : <FileIcon />}
                                </div>
                                <div className="item-name">{item.name}</div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-folder">This folder is empty.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
