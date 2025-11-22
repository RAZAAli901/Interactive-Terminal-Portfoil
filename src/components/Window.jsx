import { useState, useRef, useEffect } from 'react';

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
        if (e.target.closest('.window-controls') || e.target.closest('.resize-handle')) return;
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
            className={`window-frame ${isMaximized ? 'maximized' : ''}`}
            style={{
                transform: isMaximized ? 'none' : `translate(${position.x}px, ${position.y}px)`,
                width: isMaximized ? '100%' : size.width,
                height: isMaximized ? 'calc(100% - 40px)' : size.height,
                top: isMaximized ? 0 : undefined,
                left: isMaximized ? 0 : undefined,
            }}
        >
            <div className="window-header" onMouseDown={handleMouseDown}>
                <div className="window-tab">
                    <span className="tab-icon">_&gt;</span>
                    <span className="tab-title">{title}</span>
                </div>
                <div className="window-controls">
                    <button className="control-btn minimize" onClick={onMinimize}>_</button>
                    <button className="control-btn maximize" onClick={toggleMaximize}>□</button>
                    <button className="control-btn close" onClick={onClose}>×</button>
                </div>
            </div>
            <div className="window-content">
                {children}
            </div>
            {!isMaximized && (
                <div
                    className="resize-handle"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsResizing(true);
                    }}
                />
            )}
        </div>
    );
}
