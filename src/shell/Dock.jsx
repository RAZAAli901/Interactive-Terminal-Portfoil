import styles from './Dock.module.css';

/**
 * Bottom-center dock: one pill per open window, minimized ones included.
 * Purely presentational — clicking a pill hands the id back to the window
 * manager, which decides whether that means "focus" or "restore".
 */
export default function Dock({ windows = [], onSelect }) {
  if (!windows.length) return null;

  return (
    <div className={styles.dock} role="group" aria-label="Open windows">
      {windows.map((w) => (
        <button
          key={w.id}
          type="button"
          className={[
            styles.pill,
            w.minimized ? styles.minimized : styles.active,
            w.focused && !w.minimized ? styles.focused : '',
          ].filter(Boolean).join(' ')}
          onClick={() => onSelect?.(w.id)}
          aria-label={w.minimized ? `Restore ${w.title}` : `Focus ${w.title}`}
          aria-pressed={Boolean(w.focused) && !w.minimized}
          title={w.title}
        >
          <span className={styles.dot} style={{ background: w.color }} aria-hidden="true" />
          <span className={styles.label}>{w.title}</span>
        </button>
      ))}
    </div>
  );
}
