import styles from './TilingOverlays.module.css';

const GRAB = 12; // width/height of the invisible hit-area over each 8px gap

/**
 * Draggable resize handles sitting in the gaps between tiled panes. Each one is
 * a 12px strip centred on its 8px gap, so the grab zone is comfortable without
 * widening the visible gap.
 */
export function Dividers({ dividers, onDragStart }) {
  if (!dividers?.length) return null;
  return dividers.map((d) => {
    const vertical = d.dir === 'row';
    const style = vertical
      ? { left: d.x + (d.size - GRAB) / 2, top: d.y, width: GRAB, height: d.len }
      : { left: d.x, top: d.y + (d.size - GRAB) / 2, width: d.len, height: GRAB };
    return (
      <div
        key={d.sid}
        role="separator"
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
        aria-label={vertical ? 'Resize panes horizontally' : 'Resize panes vertically'}
        className={`${styles.divider} ${vertical ? styles.row : styles.col}`}
        style={style}
        onMouseDown={(e) => onDragStart?.(d, e)}
      />
    );
  });
}

/** Dashed highlight over the pane the dragged window would swap into. */
export function SwapTarget({ rect }) {
  if (!rect) return null;
  return (
    <div
      className={styles.swapTarget}
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
    />
  );
}

/** Chip trailing the cursor while a title bar is being dragged. */
export function DragGhost({ cursor, title, color }) {
  if (!cursor) return null;
  return (
    <div
      className={styles.ghost}
      style={{ left: cursor.x + 14, top: cursor.y + 14, '--ghost-color': color }}
    >
      <span className={styles.ghostDot} aria-hidden="true" />
      {title}
    </div>
  );
}
