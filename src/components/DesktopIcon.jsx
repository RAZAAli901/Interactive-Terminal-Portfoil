import { useState } from 'react';
import styles from './DesktopIcon.module.css';

export default function DesktopIcon({ label, icon, onDoubleClick }) {
    const [isClicked, setIsClicked] = useState(false);

    const handleDoubleClick = (e) => {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 300);
        onDoubleClick(e);
    };

    const renderIcon = () => {
        if (label === 'Terminal') {
            return (
                <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="termGrad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#1a1a2e" />
                            <stop offset="1" stopColor="#0d0d0d" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <rect x="4" y="4" width="48" height="48" rx="8" fill="url(#termGrad)" stroke="#333" strokeWidth="2"/>
                    <path d="M14 20l8 8-8 8M28 36h14" stroke="#00ff00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
                </svg>
            );
        }
        if (label === 'My Computer') {
            return (
                <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="screenGrad" x1="12" y1="12" x2="44" y2="36" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#0078D7" />
                            <stop offset="1" stopColor="#004e92" />
                        </linearGradient>
                    </defs>
                    <path d="M8 38V12C8 9.79086 9.79086 8 12 8H44C46.2091 8 48 9.79086 48 12V38" fill="#e0e0e0" stroke="#b0b0b0" strokeWidth="2"/>
                    <rect x="12" y="12" width="32" height="24" rx="1" fill="url(#screenGrad)"/>
                    <path d="M4 42C4 40.8954 4.89543 40 6 40H50C51.1046 40 52 40.8954 52 42V44C52 46.2091 50.2091 48 48 48H8C5.79086 48 4 46.2091 4 44V42Z" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="2"/>
                    <path d="M22 44h12" stroke="#808080" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            );
        }
        if (label === 'Recycle Bin') {
            return (
                <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="binGrad" x1="16" y1="20" x2="40" y2="48" gradientUnits="userSpaceOnUse">
                            <stop stopColor="rgba(0, 164, 239, 0.6)" />
                            <stop offset="1" stopColor="rgba(0, 100, 200, 0.2)" />
                        </linearGradient>
                    </defs>
                    <path d="M16 20l4 28h16l4-28" fill="url(#binGrad)" stroke="#c0c0c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 20h36" stroke="#e0e0e0" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M20 20v-4c0-2.20914 1.79086-4 4-4h8c2.20914 0 4 1.79086 4 4v4" stroke="#c0c0c0" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="24" y1="26" x2="25" y2="42" stroke="#c0c0c0" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="32" y1="26" x2="31" y2="42" stroke="#c0c0c0" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            );
        }
        if (label === 'Notepad') {
            return (
                <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="14" y="8" width="28" height="40" rx="2" fill="#fff5b1" stroke="#e6c822" strokeWidth="2"/>
                    <path d="M14 16h28M14 24h28M14 32h28M14 40h28" stroke="#e6c822" strokeWidth="2" strokeOpacity="0.5"/>
                    <rect x="14" y="8" width="28" height="6" fill="#cc1111"/>
                    <path d="M42 20l-4-4-16 16v4h4l16-16z" fill="#f4a460" stroke="#8b4513" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M22 36l-2-2-2 6 6-2-2-2z" fill="#333" stroke="#333" strokeLinejoin="round"/>
                </svg>
            );
        }
        return icon;
    };

    return (
        <div 
            className={`${styles.desktopIcon} ${isClicked ? styles.clicked : ''}`} 
            onDoubleClick={handleDoubleClick}
            title={label}
        >
            <div className={styles.iconImg}>{renderIcon()}</div>
            <div className={styles.iconLabel}>{label}</div>
        </div>
    );
}
