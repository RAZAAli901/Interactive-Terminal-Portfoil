import { useState, useRef, useEffect, useCallback } from 'react';
import { createDraggable } from 'animejs';
import styles from './Window.module.css';

export default function Window({
    children,
    title = "Terminal",
    icon = "🖥️",
    onClose,
    onMinimize,
    isMinimized,
    defaultWidth = 800,
    defaultHeight = 500,
    offsetX = 0,
    offsetY = 0,
    zIndex = 1,
    onFocus,
}) {
    const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
    const [isMaximized, setIsMaximized] = useState(false);
    const [preMaximizeState, setPreMaximizeState] = useState(null);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState(null);

    const windowRef = useRef(null);
    const headerRef = useRef(null);   // ← direct ref to the drag handle element
    const draggableRef = useRef(null);

    const isTerminal = title === "Terminal" || title === "Command Prompt";

    // ── anime.js draggable ────────────────────────────────────────────────────
    useEffect(() => {
        const el = windowRef.current;
        const handle = headerRef.current;
        if (!el || !handle || isMaximized) return;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const taskbar = 40;

        // Centre the window (+ optional offset)
        const startX = Math.max(0, (vw - defaultWidth) / 2) + offsetX;
        const startY = Math.max(0, (vh - defaultHeight) / 2) + offsetY;

        // Set transform BEFORE creating the draggable so anime.js reads it as origin
        el.style.transform = `translate(${startX}px, ${startY}px)`;

        draggableRef.current = createDraggable(el, {
            // Pass the actual DOM node — avoids CSS-module hashed-selector mismatch
            trigger: handle,

            // Clamp translate values so the window can't go off-screen
            x: {
                modifier: (v) => Math.max(0, Math.min(v, vw - size.width)),
            },
            y: {
                modifier: (v) => Math.max(0, Math.min(v, vh - taskbar - size.height)),
            },

            // Smooth physics on release
            releaseEase: 'outExpo',
            velocityMultiplier: 0.9,

            onGrab() {
                if (onFocus) onFocus();
                el.classList.add(styles.dragging);
            },
            onRelease() {
                el.classList.remove(styles.dragging);
            },
        });

        return () => {
            draggableRef.current?.revert();
            draggableRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMaximized]);

    // ── Maximize / Restore ────────────────────────────────────────────────────
    const toggleMaximize = () => {
        const el = windowRef.current;
        if (isMaximized) {
            const { x, y, w, h } = preMaximizeState;
            setSize({ width: w, height: h });
            setIsMaximized(false);
            // useEffect will re-run and re-create the draggable, but we want the
            // saved position — restore it right after the next paint
            requestAnimationFrame(() => {
                if (el) el.style.transform = `translate(${x}px, ${y}px)`;
            });
        } else {
            // Read the current translate from the element's computed style
            const m = new DOMMatrix(getComputedStyle(el).transform);
            setPreMaximizeState({ x: m.m41, y: m.m42, w: size.width, h: size.height });
            setIsMaximized(true);
        }
    };

    // ── Resize (corner handle) ────────────────────────────────────────────────
    const handleResizeMouseDown = useCallback((e) => {
        e.stopPropagation();
        setIsResizing(true);
        const rect = windowRef.current?.getBoundingClientRect();
        setResizeStart({
            mouseX: e.clientX,
            mouseY: e.clientY,
            startW: rect?.width ?? size.width,
            startH: rect?.height ?? size.height,
        });
    }, [size]);

    useEffect(() => {
        if (!isResizing) return;
        const onMove = (e) => {
            if (!resizeStart) return;
            setSize({
                width: Math.max(320, resizeStart.startW + (e.clientX - resizeStart.mouseX)),
                height: Math.max(240, resizeStart.startH + (e.clientY - resizeStart.mouseY)),
            });
        };
        const onUp = () => setIsResizing(false);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [isResizing, resizeStart]);

    // ── Styles ────────────────────────────────────────────────────────────────
    const frameStyle = isMaximized
        ? {
            left: 0, top: 0,
            transform: 'none',
            width: '100%',
            height: 'calc(100% - 40px)',
            zIndex,
            opacity: isMinimized ? 0 : 1,
            pointerEvents: isMinimized ? 'none' : 'auto',
        }
        : {
            left: 0, top: 0,          // anime.js owns the actual position via transform
            width: size.width,
            height: size.height,
            zIndex,
            opacity: isMinimized ? 0 : 1,
            pointerEvents: isMinimized ? 'none' : 'auto',
        };

    return (
        <div
            ref={windowRef}
            role="dialog"
            aria-label={`${title} window`}
            aria-labelledby={`win-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className={[
                styles.windowFrame,
                isMaximized ? styles.maximized : '',
                isResizing ? styles.resizing : '',
                isMinimized ? styles.minimized : '',
            ].join(' ')}
            onMouseDown={() => onFocus && onFocus()}
            style={frameStyle}
        >
            {/* ── Title bar — this element is the drag handle (headerRef) ── */}
            <div
                ref={headerRef}
                className={`${styles.windowHeader} ${!isTerminal ? styles.lightHeader : ''}`}
                onDoubleClick={toggleMaximize}
            >
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
                    <button className={`${styles.controlBtn} ${styles.maximize}`} onClick={toggleMaximize} title={isMaximized ? 'Restore Down' : 'Maximize'} aria-label={isMaximized ? 'Restore window' : 'Maximize window'}>
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

            {/* ── Content ── */}
            <div className={styles.windowContent} style={{ backgroundColor: isTerminal ? '#0c0c0c' : '#ffffff' }}>
                {children}
            </div>

            {/* ── Resize corner ── */}
            {!isMaximized && (
                <div className={styles.resizeHandle} onMouseDown={handleResizeMouseDown} />
            )}
        </div>
    );
}
