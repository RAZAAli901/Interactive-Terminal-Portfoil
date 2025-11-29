import { useState, useRef, useEffect } from 'react';
import styles from './Window.module.css';

export default function Window({ children, title = "Terminal", onClose, onMinimize, onMaximize, isMinimized }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: 800, height: 600 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isMaximized, setIsMaximized] = useState(false);
    const [preMaximizeState, setPreMaximizeState] = useState(null);

    const windowRef = useRef(null);

    useEffect(() => {
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;
        setPosition({
            x: (winWidth - 800) / 2,
            y: (winHeight - 600) / 2,
        });
    }, []);

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
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
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

    if (isMinimized) return null;

    return (
        <div
            ref={windowRef}
            className={`${styles.windowFrame} ${isMaximized ? styles.maximized : ''}`}
            style={{
                transform: isMaximized ? 'none' : `translate(${position.x}px, ${position.y}px)`,
                width: isMaximized ? '100%' : size.width,
                height: isMaximized ? 'calc(100% - 40px)' : size.height,
                top: isMaximized ? 0 : undefined,
                left: isMaximized ? 0 : undefined,
            }}
        >
            <div className={styles.windowHeader} onMouseDown={handleMouseDown}>
                <div className={styles.tabBar}>
                    <div className={styles.windowTab}>
                        <span className={styles.tabIcon}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="3" width="12" height="10" rx="1" fill="#333" />
                                <path d="M4 6L6 8L4 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 10H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </span>
                        <span className={styles.tabTitle}>Command Prompt</span>
                        <span className={styles.tabCloseBtn} onClick={onClose}>×</span>
                    </div>
                    <div className={styles.newTabBtn}>+</div>
                </div>
                <div className={styles.windowControls}>
                    <button className={`${styles.controlBtn} ${styles.minimize}`} onClick={onMinimize}>
                        <svg viewBox="0 0 10 1"><path d="M0 0h10v1H0z" /></svg>
                    </button>
                    <button className={`${styles.controlBtn} ${styles.maximize}`} onClick={toggleMaximize}>
                        {isMaximized ? (
                            <svg viewBox="0 0 10 10"><path d="M2.1 0v2H0v8.1h8.2v-2h2V0H2.1zm6.1 2.1h-2v6h-6v-6h8v6z" /></svg>
                        ) : (
                            <svg viewBox="0 0 10 10"><path d="M0 0v10h10V0H0zm9 9H1V1h8v8z" /></svg>
                        )}
                    </button>
                    <button className={`${styles.controlBtn} ${styles.close}`} onClick={onClose}>
                        <svg viewBox="0 0 10 10"><path d="M9.35 0L5 4.35 0.65 0 0 0.65 4.35 5 0 9.35 0.65 10 5 5.65 9.35 10 10 9.35 5.65 5 10 0.65z" /></svg>
                    </button>
                </div>
            </div>
            <div className={styles.windowContent}>
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
