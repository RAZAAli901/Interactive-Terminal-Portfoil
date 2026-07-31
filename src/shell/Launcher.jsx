import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, enabledApps } from '../config/apps';
import { useFocusTrap } from './useFocusTrap';
import styles from './Launcher.module.css';

/**
 * Fuzzy subsequence score: -1 if `q` is not a subsequence of `text`, otherwise
 * higher is better. Consecutive character matches score a bonus, and matches
 * nearer the start of the text are preferred.
 */
function subsequenceScore(q, text) {
  if (!q) return 0;
  let from = 0;
  let score = 0;
  let prev = -2;
  for (const c of q) {
    const found = text.indexOf(c, from);
    if (found === -1) return -1;
    score += found === prev + 1 ? 2 : 1;
    prev = found;
    from = found + 1;
  }
  return score - text.indexOf(q[0]) * 0.05;
}

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

  const apps = useMemo(() => enabledApps(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps
      .map((a) => ({ a, s: Math.max(subsequenceScore(q, a.name.toLowerCase()), subsequenceScore(q, a.exec.toLowerCase())) }))
      .filter((x) => x.s >= 0)
      .sort((x, y) => y.s - x.s)
      .map((x) => x.a);
  }, [query, apps]);

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
      <div ref={panelRef} className={styles.panel} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Application launcher">
        <div className={styles.searchRow}>
          <span className={styles.searchIcon} aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            className={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search applications…"
            aria-label="Search applications"
          />
        </div>
        <div className={styles.list} role="listbox">
          {results.length === 0 && <div className={styles.empty}>No matching applications</div>}
          {results.map((app, i) => (
            <div
              key={app.id}
              role="option"
              aria-selected={i === sel}
              className={`${styles.row} ${i === sel ? styles.selected : ''}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => launch(app)}
            >
              <span className={styles.rowIcon}>{app.icon}</span>
              <span className={styles.rowText}>
                <span className={styles.rowName}>{app.name}</span>
                <span className={styles.rowExec}>{app.exec}</span>
              </span>
              <span className={styles.rowCat}>{CATEGORIES[app.category]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
