import styles from './Notifications.module.css';

/** Renders the active notification toasts (top-right). */
export default function Notifications({ items, onDismiss }) {
  if (!items.length) return null;
  return (
    <div className={styles.stack} role="region" aria-label="Notifications" aria-live="polite">
      {items.map((n) => (
        <div key={n.id} className={styles.toast} onClick={() => onDismiss?.(n.id)}>
          <span className={styles.icon} aria-hidden="true">{n.icon}</span>
          <div className={styles.body}>
            <div className={styles.title}>{n.title}</div>
            {n.text && <div className={styles.text}>{n.text}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
