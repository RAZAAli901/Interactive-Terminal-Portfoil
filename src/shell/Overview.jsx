import styles from './Overview.module.css';

/**
 * hyprexpo backdrop + caption. The scaled thumbnails themselves are positioned
 * by the window manager via `overviewLayout`, so this component owns only the
 * dim/blur layer and the hint line; clicking anywhere on it leaves overview.
 */
export default function Overview({ open, count = 0, onExit }) {
  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-label="Window overview"
      onClick={() => onExit?.()}
    >
      <p className={styles.caption}>
        <span className={styles.count}>{count}</span> windows — click to focus ·{' '}
        <span className={styles.key}>Esc</span> to exit
      </p>
    </div>
  );
}
