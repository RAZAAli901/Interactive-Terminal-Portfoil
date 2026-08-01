import { useEffect, useMemo, useRef, useState } from 'react';
import { LAUNCHABLE } from '../config/riceApps';
import { useFocusTrap } from './useFocusTrap';
import { searchApps } from './launcherSearch';
import styles from './Launcher.module.css';

/**
 * Wofi/rofi-style application launcher. Fuzzy-filters the enabled app registry;
 * arrow keys + Enter to launch, Escape to close.
 */
export default function Launcher({ isOpen, onLaunch, onClose }) {
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  useFocusTrap(isOpen, panelRef);

  const apps = useMemo(() => LAUNCHABLE, []);

  const results = useMemo(() => searchApps(query, apps), [query, apps]);

  // Reset + focus whenever the launcher opens.
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSel(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => { setSel(0); }, [query]);

  if (!isOpen) return null;

  const launch = (app) => {
    if (!app) return;
    onLaunch?.(app.id);
    onClose?.();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); launch(results[sel]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose?.(); }
  };

  return (
    <div className={styles.overlay} onMouseDown={onClose} role="presentation">
      <div
        ref={panelRef}
        className={styles.panel}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        role="dialog"
        aria-modal="true"
        aria-label="Application launcher"
      >
        <div className={styles.searchRow}>
          <span className={styles.searchIcon} aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            className={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search applications…"
            aria-label="Search applications"
            role="combobox"
            aria-expanded="true"
            aria-controls="launcher-results"
            aria-autocomplete="list"
            aria-activedescendant={results[sel] ? `launcher-opt-${results[sel].id}` : undefined}
          />
        </div>
        <div className={styles.hintbar} aria-hidden="true">
          <span>↑↓ navigate</span>
          <span>↵ launch</span>
          <span>esc close</span>
          <span className={styles.count}>{results.length} apps</span>
        </div>
        <div className={styles.list} id="launcher-results" role="listbox" aria-label="Applications">
          {results.length === 0 && <div className={styles.empty}>No matching applications</div>}
          {results.map((app, i) => (
            <div
              key={app.id}
              id={`launcher-opt-${app.id}`}
              role="option"
              aria-selected={i === sel}
              className={`${styles.row} ${i === sel ? styles.selected : ''}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => launch(app)}
            >
              <span className={styles.rowIcon} style={{ color: app.color }} aria-hidden="true">●</span>
              <span className={styles.rowText}>
                <span className={styles.rowName}>{app.name}</span>
                <span className={styles.rowExec}>{app.exec}</span>
              </span>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
