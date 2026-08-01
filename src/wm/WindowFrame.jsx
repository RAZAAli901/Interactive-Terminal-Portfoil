import styles from './WindowFrame.module.css';

/**
 * Hyprland-style window frame.
 *
 * Fully controlled: the orchestrator owns geometry (tiled rects come from the
 * BSP tree, floating rects from the window record) and owns all pointer drags,
 * because a title-bar drag means different things per layout — swap two panes
 * in dwindle mode, move the window in floating mode. The frame just reports
 * `onDragStart` and renders.
 *
 * Chrome follows the design handoff: 11px radius, glass + saturate blur, a 34px
 * title bar with a 9px app-colour dot, and a focus ring driven by the accent.
 */
export default function WindowFrame({
  children,
  title = 'kitty',
  color,
  rect,
  zIndex = 100,
  isActive = false,
  isTerminal = false,
  isMinimized = false,
  isDragging = false,
  hidden = false,
  animated = true,
  floating = false,
  overviewStyle = null,
  onFocus,
  onClose,
  onMinimize,
  onDragStart,
  onResizeStart,
}) {
  // Overview supplies its own transform/scale; otherwise place by rect.
  const geometry = overviewStyle || (rect
    ? { left: rect.x, top: rect.y, width: rect.w, height: rect.h }
    : {});

  const style = hidden
    // On another workspace — keep mounted (preserves app state) but not shown.
    ? { display: 'none' }
    // Overview supplies its own stacking, so it must win over the tiling z.
    : { zIndex, ...geometry, '--win-color': color || 'var(--hypr-accent, #7aa2f7)' };

  const stop = (e) => e.stopPropagation();

  return (
    <div
      role="dialog"
      aria-label={`${title} window`}
      className={[
        styles.frame,
        isTerminal ? styles.terminal : '',
        isActive ? styles.active : '',
        isDragging ? styles.dragging : '',
        isMinimized ? styles.minimized : '',
        animated && !overviewStyle ? styles.animated : '',
      ].filter(Boolean).join(' ')}
      style={style}
      onMouseDown={() => onFocus?.()}
    >
      <div
        className={styles.handle}
        onMouseDown={(e) => { if (e.button === 0) onDragStart?.(e); }}
      >
        <span className={styles.title}>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.titleText}>{title}</span>
        </span>
        <div className={styles.controls}>
          {onMinimize && (
            <button
              className={`${styles.ctl} ${styles.min}`}
              onMouseDown={stop}
              onClick={onMinimize}
              title="Minimize"
              aria-label="Minimize"
            >
              –
            </button>
          )}
          <button
            className={`${styles.ctl} ${styles.close}`}
            onMouseDown={stop}
            onClick={onClose}
            title="Close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <div className={styles.content}>{children}</div>

      {floating && !overviewStyle && (
        <div
          className={styles.resizeHandle}
          onMouseDown={(e) => { e.stopPropagation(); onResizeStart?.(e); }}
        />
      )}
    </div>
  );
}
