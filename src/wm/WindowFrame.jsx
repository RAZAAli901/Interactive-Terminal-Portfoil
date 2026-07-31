import { useCallback, useEffect, useRef, useState } from 'react';
import { createDraggable } from 'animejs';
import styles from './WindowFrame.module.css';

/**
 * Hyprland-style window frame.
 *
 * Floating windows are draggable (anime.js) and resizable. The chrome is a slim
 * translucent handle instead of a Windows titlebar; focus is shown by an
 * animated gradient border. Spawn/close use scale+fade animations.
 *
 * Prop contract is compatible with the old <Window> so App can swap it in.
 */
export default function WindowFrame({
  children,
  title = 'kitty',
  icon = '\u{1F5A5}️',
  onClose,
  onToggleFloating,
  isMinimized,
  isActive = false,
  tiled = false,
  rect = null,
  hidden = false,
  defaultWidth = 820,
  defaultHeight = 520,
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
  const [isClosing, setIsClosing] = useState(false);
  const [hasSpawned, setHasSpawned] = useState(false);

  const frameRef = useRef(null);
  const handleRef = useRef(null);
  const draggableRef = useRef(null);

  const waybar = 40;

  // ── anime.js draggable (floating windows only) ─────────────────────────────
  useEffect(() => {
    const el = frameRef.current;
    const handle = handleRef.current;
    if (!el || !handle || isMaximized || tiled) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const startX = Math.max(0, (vw - defaultWidth) / 2) + offsetX;
    const startY = Math.max(waybar, (vh - defaultHeight) / 2) + offsetY;

    el.style.setProperty('--tx', `${startX}px`);
    el.style.setProperty('--ty', `${startY}px`);
    el.style.transform = `translate(${startX}px, ${startY}px)`;

    draggableRef.current = createDraggable(el, {
      trigger: handle,
      x: { modifier: (v) => Math.max(0, Math.min(v, vw - size.width)) },
      y: { modifier: (v) => Math.max(waybar, Math.min(v, vh - size.height)) },
      releaseEase: 'outExpo',
      velocityMultiplier: 0.9,
      onGrab() { onFocus?.(); },
    });

    return () => {
      draggableRef.current?.revert();
      draggableRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMaximized, tiled]);

  // ── Close with animation ───────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    const el = frameRef.current;
    if (el) {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      el.style.setProperty('--tx', `${m.m41}px`);
      el.style.setProperty('--ty', `${m.m42}px`);
    }
    setIsClosing(true);
    const dur = 180;
    window.setTimeout(() => onClose?.(), dur);
  }, [onClose]);

  // ── Maximize / restore ─────────────────────────────────────────────────────
  const toggleMaximize = () => {
    const el = frameRef.current;
    if (isMaximized) {
      const { x, y, w, h } = preMaximizeState;
      setSize({ width: w, height: h });
      setIsMaximized(false);
      requestAnimationFrame(() => { if (el) el.style.transform = `translate(${x}px, ${y}px)`; });
    } else {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      setPreMaximizeState({ x: m.m41, y: m.m42, w: size.width, h: size.height });
      setIsMaximized(true);
    }
  };

  // ── Resize (corner handle) ─────────────────────────────────────────────────
  const handleResizeMouseDown = useCallback((e) => {
    e.stopPropagation();
    setIsResizing(true);
    const rect = frameRef.current?.getBoundingClientRect();
    setResizeStart({ mouseX: e.clientX, mouseY: e.clientY, startW: rect?.width ?? size.width, startH: rect?.height ?? size.height });
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

  let frameStyle;
  if (hidden) {
    // On another workspace — keep mounted (preserve app state) but not shown.
    frameStyle = { display: 'none' };
  } else if (isMaximized) {
    frameStyle = { left: 0, top: waybar, transform: 'none', width: '100%', height: `calc(100% - ${waybar}px)`, zIndex, pointerEvents: isMinimized ? 'none' : 'auto' };
  } else if (tiled && rect) {
    // Tiled: absolute geometry from the dwindle layout, no drag transform.
    frameStyle = { left: rect.x, top: rect.y, width: rect.w, height: rect.h, transform: 'none', zIndex, pointerEvents: isMinimized ? 'none' : 'auto' };
  } else {
    // Floating: anime.js owns position via transform; left/top stay 0.
    frameStyle = { width: size.width, height: size.height, zIndex, pointerEvents: isMinimized ? 'none' : 'auto' };
  }

  return (
    <div
      ref={frameRef}
      role="dialog"
      aria-label={`${title} window`}
      className={[
        styles.frame,
        isActive ? styles.active : '',
        isMaximized ? styles.maximized : '',
        isMinimized ? styles.minimized : '',
        isClosing ? styles.closing : (!hasSpawned ? styles.spawning : ''),
      ].join(' ')}
      style={frameStyle}
      onMouseDown={() => onFocus?.()}
      onAnimationEnd={(e) => { if (e.animationName.includes('hyprSpawn')) setHasSpawned(true); }}
    >
      <div ref={handleRef} className={styles.handle} onDoubleClick={toggleMaximize}>
        <span className={styles.title}>
          <span className={styles.titleIcon}>{icon}</span>
          <span>{title}</span>
        </span>
        <div className={styles.controls}>
          <button className={`${styles.dot} ${styles.float}`} title="Toggle floating" aria-label="Toggle floating" onClick={onToggleFloating}>◻</button>
          <button className={`${styles.dot} ${styles.max}`} title="Maximize" aria-label="Maximize" onClick={toggleMaximize}>▢</button>
          <button className={`${styles.dot} ${styles.close}`} title="Close" aria-label="Close" onClick={handleClose}>✕</button>
        </div>
      </div>

      <div className={styles.content}>{children}</div>

      {!isMaximized && !tiled && <div className={styles.resizeHandle} onMouseDown={handleResizeMouseDown} />}
    </div>
  );
}
