import { useEffect } from 'react';
import styles from './PowerMenu.module.css';

const ACTIONS = [
  { id: 'lock', label: 'Lock', glyph: '\u{1F512}' },
  { id: 'logout', label: 'Logout', glyph: '\u{21A9}' },
  { id: 'reboot', label: 'Reboot', glyph: '\u{21BB}' },
  { id: 'shutdown', label: 'Shutdown', glyph: '⏻' },
];

/**
 * wlogout-style power menu: a row of large action buttons. The parent decides
 * what each action does (reboot replays the boot sequence, etc.).
 */
export default function PowerMenu({ isOpen, onClose, onAction }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onMouseDown={onClose} role="dialog" aria-label="Power menu">
      {ACTIONS.map((a) => (
        <button
          key={a.id}
          className={styles.btn}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onAction?.(a.id)}
          aria-label={a.label}
        >
          <span className={styles.glyph} aria-hidden="true">{a.glyph}</span>
          {a.label}
        </button>
      ))}
      <div className={styles.hint}>Esc to cancel</div>
    </div>
  );
}
