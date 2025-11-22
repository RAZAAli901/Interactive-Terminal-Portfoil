import React from 'react';

export default function StartMenu({ isOpen, onAppClick }) {
    if (!isOpen) return null;

    return (
        <div className="start-menu">
            <div className="start-menu-left">
                <div className="start-item" onClick={() => onAppClick('terminal')}>
                    <span className="start-icon">💻</span>
                    <span className="start-label">Terminal</span>
                </div>
                <div className="start-item" onClick={() => onAppClick('explorer')}>
                    <span className="start-icon">🖥️</span>
                    <span className="start-label">My Computer</span>
                </div>
                <div className="start-item" onClick={() => alert("Not implemented")}>
                    <span className="start-icon">🗑️</span>
                    <span className="start-label">Recycle Bin</span>
                </div>
                <div className="start-divider"></div>
                <div className="start-item" onClick={() => alert("All Programs...")}>
                    <span className="start-label">All Programs ▶</span>
                </div>
                <div className="search-box">
                    <input type="text" placeholder="Search programs and files" />
                </div>
            </div>
            <div className="start-menu-right">
                <div className="user-profile">
                    <div className="user-pic">👤</div>
                    <div className="user-name">Visitor</div>
                </div>
                <div className="right-links">
                    <div className="right-link">Documents</div>
                    <div className="right-link">Pictures</div>
                    <div className="right-link">Music</div>
                    <div className="right-divider"></div>
                    <div className="right-link">Computer</div>
                    <div className="right-link">Control Panel</div>
                    <div className="right-link">Devices and Printers</div>
                    <div className="right-link">Help and Support</div>
                </div>
                <div className="shutdown-container">
                    <button className="shutdown-btn" onClick={() => window.location.reload()}>
                        Shut down
                    </button>
                </div>
            </div>
        </div>
    );
}
