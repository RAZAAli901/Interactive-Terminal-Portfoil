import { useEffect } from 'react';
import styles from './KeybindCheatsheet.module.css';

const BINDS = [
  { keys: ['Super', 'D'], desc: 'Open app launcher' },
  { keys: ['Super', 'Return'], desc: 'Open terminal' },
  { keys: ['Super', 'Q'], desc: 'Close focused window' },
  { keys: ['Super', 'J / K'], desc: 'Cycle window focus' },
  { keys: ['Super', 'Space'], desc: 'Toggle floating / tiled' },
  { keys: ['Super', 'F'], desc: 'Fullscreen window' },
  { keys: ['Super', 'P'], desc: 'Screenshot' },
  { keys: ['Super', '1-5'], desc: 'Switch workspace' },
  { keys: ['Super', 'H / L'], desc: 'Previous / next workspace' },
  { keys: ['Super', 'Esc'], desc: 'Power menu' },
  { keys: ['Super', '/'], desc: 'Toggle this cheatsheet' },
];

/** Hyprland keybind cheatsheet (Super+/). */
export default function KeybindCheatsheet({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onMouseDown={onClose} role="dialog" aria-label="Keyboard shortcuts">
      <div className={styles.panel} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>Keyboard shortcuts</div>
        <div className={styles.rows}>
          {BINDS.map((b) => (
            <div className={styles.row} key={b.desc}>
              <span>{b.desc}</span>
              <span className={styles.keys}>
                {b.keys.map((k) => <span className={styles.key} key={k}>{k}</span>)}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.foot}>Super = ⌘ / Windows key · Esc to close</div>
      </div>
    </div>
  );
}
