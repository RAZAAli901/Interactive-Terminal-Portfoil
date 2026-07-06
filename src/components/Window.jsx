import { useState, useRef, useEffect } from 'react';
import styles from './Window.module.css';

export default function Window({ children, title = "Terminal", icon = "🖥️", onClose, onMinimize, isMinimized, defaultWidth = 800, defaultHeight = 500, offsetX = 0, offsetY = 0, zIndex = 1, onFocus }) {
    const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
    const [position, setPosition] = useState(() => {
        if (typeof window !== 'undefined') {
            return {
                x: Math.max(0, (window.innerWidth - defaultWidth) / 2) + offsetX,
                y: Math.max(0, (window.innerHeight - defaultHeight) / 2) + offsetY,
            };
        }
        return { x: 0, y: 0 };
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isMaximized, setIsMaximized] = useState(false);
    const [preMaximizeState, setPreMaximizeState] = useState(null);

    const windowRef = useRef(null);
    const isTerminal = title === "Terminal" || title === "Command Prompt";
    const handleMouseDown = (e) => {
        if (e.target.closest(`.${styles.windowControls}`) || e.target.closest(`.${styles.resizeHandle}`)) return;
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e) => {
        if (isDragging && !isMaximized) {
            let newX = e.clientX - dragOffset.x;
            let newY = e.clientY - dragOffset.y;
            
            // Edge snapping logic
            const snapThreshold = 20;
            if (newX < snapThreshold) newX = 0;
            if (newY < snapThreshold) newY = 0;
            if (newX + size.width > window.innerWidth - snapThreshold) newX = window.innerWidth - size.width;
            if (newY + size.height > window.innerHeight - snapThreshold) newY = window.innerHeight - size.height;

            setPosition({
                x: newX,
                y: newY,
            });
        }
        if (isResizing && !isMaximized) {
            setSize({
                width: Math.max(400, e.clientX - position.x),
                height: Math.max(300, e.clientY - position.y),
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, isMaximized]);

    const toggleMaximize = () => {
        if (isMaximized) {
            setPosition(preMaximizeState.position);
            setSize(preMaximizeState.size);
            setIsMaximized(false);
        } else {
            setPreMaximizeState({ position, size });
            setPosition({ x: 0, y: 0 });
            setSize({ width: window.innerWidth, height: window.innerHeight });
            setIsMaximized(true);
        }
    };

    return (
        <div
            ref={windowRef}
            role="dialog"
            aria-label={`${title} window`}
            aria-labelledby={`win-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className={`${styles.windowFrame} ${isMaximized ? styles.maximized : ''} ${isDragging ? styles.dragging : ''} ${isResizing ? styles.resizing : ''} ${isMinimized ? styles.minimized : ''}`}
            onMouseDown={() => onFocus && onFocus()}
            style={{
                transform: isMinimized ? 'scale(0.8) translateY(300px)' : (isMaximized ? 'none' : `translate(${position.x}px, ${position.y}px)`),
                width: isMaximized ? '100%' : size.width,
                height: isMaximized ? 'calc(100% - 40px)' : size.height,
                top: 0,
                left: 0,
                zIndex: zIndex,
                opacity: isMinimized ? 0 : 1,
                pointerEvents: isMinimized ? 'none' : 'auto',
            }}
        >
            <div className={`${styles.windowHeader} ${!isTerminal ? styles.lightHeader : ''}`} onMouseDown={handleMouseDown} onDoubleClick={toggleMaximize}>
                {isTerminal ? (
                    <div className={styles.tabBar}>
                        <div className={styles.windowTab}>
                            <span className={styles.tabIcon}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="2" y="3" width="12" height="10" rx="1" fill="#333" />
                                    <path d="M4 6L6 8L4 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 10H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </span>
                            <span id={`win-title-${title.replace(/\s+/g, '-').toLowerCase()}`} className={styles.tabTitle}>{title}</span>
                            <span className={styles.tabCloseBtn} onClick={onClose}>×</span>
                        </div>
                        <div className={styles.newTabBtn}>+</div>
                    </div>
                ) : (
                    <div className={styles.simpleTitleBar}>
                        <span className={styles.simpleIcon}>{icon}</span>
                        <span id={`win-title-${title.replace(/\s+/g, '-').toLowerCase()}`} className={styles.simpleTitle}>{title}</span>
                    </div>
                )}
                <div className={`${styles.windowControls} ${!isTerminal ? styles.lightControls : ''}`}>
                    <button className={`${styles.controlBtn} ${styles.minimize}`} onClick={onMinimize} title="Minimize" aria-label="Minimize window">
                        <svg viewBox="0 0 10 1"><path d="M0 0h10v1H0z" /></svg>
                    </button>
                    <button className={`${styles.controlBtn} ${styles.maximize}`} onClick={toggleMaximize} title={isMaximized ? "Restore Down" : "Maximize"} aria-label={isMaximized ? "Restore window" : "Maximize window"}>
                        {isMaximized ? (
                            <svg viewBox="0 0 10 10"><path d="M2.1 0v2H0v8.1h8.2v-2h2V0H2.1zm6.1 2.1h-2v6h-6v-6h8v6z" /></svg>
                        ) : (
                            <svg viewBox="0 0 10 10"><path d="M0 0v10h10V0H0zm9 9H1V1h8v8z" /></svg>
                        )}
                    </button>
                    <button className={`${styles.controlBtn} ${styles.close}`} onClick={onClose} title="Close" aria-label="Close window">
                        <svg viewBox="0 0 10 10"><path d="M9.35 0L5 4.35 0.65 0 0 0.65 4.35 5 0 9.35 0.65 10 5 5.65 9.35 10 10 9.35 5.65 5 10 0.65z" /></svg>
                    </button>
                </div>
            </div>
            <div className={styles.windowContent} style={{ backgroundColor: isTerminal ? '#0c0c0c' : '#ffffff' }}>
                {children}
            </div>
            {!isMaximized && (
                <div
                    className={styles.resizeHandle}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsResizing(true);
                    }}
                />
            )}
        </div>
    );
}
