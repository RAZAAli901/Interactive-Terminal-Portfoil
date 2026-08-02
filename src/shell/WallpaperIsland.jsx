import { useEffect, useRef, useState } from 'react';
import { getWallpaper, wallpaperUrl } from '../data/wallpapers';
import styles from './WallpaperIsland.module.css';

/**
 * Dynamic-island-style wallpaper switcher, pinned to the top-right.
 *
 * Collapsed it is a small capsule showing a swatch of the current wallpaper.
 * Clicking morphs it (width / height / radius spring) into a panel of live
 * thumbnails; picking one applies it instantly and the panel stays open so the
 * change is visible behind it. Click-away, Escape, or the close button collapse
 * it back into the capsule.
 */
const COLS = 3;

export default function WallpaperIsland({ wallpapers, current, onSelect, onPreview }) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const rootRef = useRef(null);
  const thumbRefs = useRef([]);
  const active = getWallpaper(current);

  const preview = (id) => onPreview?.(id);
  const clearPreview = () => onPreview?.(null);

  const close = () => { setOpen(false); clearPreview(); };

  /** Pick a random wallpaper that isn't the current one. */
  const shuffle = () => {
    const others = wallpapers.filter((w) => w.id !== current);
    if (!others.length) return;
    onSelect(others[Math.floor(Math.random() * others.length)].id);
  };

  /** Focus + preview the thumbnail at `i` (clamped into range). */
  const focusThumb = (i) => {
    const n = wallpapers.length;
    const idx = Math.max(0, Math.min(i, n - 1));
    setSel(idx);
    preview(wallpapers[idx].id);
    thumbRefs.current[idx]?.focus();
  };

  // Roving grid navigation: arrows move by cell, Home/End jump, Enter selects.
  const onGridKeyDown = (e) => {
    const n = wallpapers.length;
    let next = null;
    switch (e.key) {
      case 'ArrowRight': next = Math.min(sel + 1, n - 1); break;
      case 'ArrowLeft': next = Math.max(sel - 1, 0); break;
      case 'ArrowDown': next = Math.min(sel + COLS, n - 1); break;
      case 'ArrowUp': next = Math.max(sel - COLS, 0); break;
      case 'Home': next = 0; break;
      case 'End': next = n - 1; break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(wallpapers[sel].id);
        return;
      default: return;
    }
    e.preventDefault();
    focusThumb(next);
  };

  // On open, land on the current wallpaper so keyboard users start there.
  useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, wallpapers.findIndex((w) => w.id === current));
    setSel(idx);
    const t = setTimeout(() => thumbRefs.current[idx]?.scrollIntoView({ block: 'nearest' }), 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Click-away + Escape close the island; closing also drops any hover preview.
  useEffect(() => {
    if (!open) return undefined;
    const dismiss = () => { setOpen(false); onPreview?.(null); };
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) dismiss(); };
    const onKey = (e) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onPreview]);

  // A closed island must never leave a stale preview applied.
  useEffect(() => { if (!open) onPreview?.(null); }, [open, onPreview]);

  return (
    <div
      ref={rootRef}
      className={`${styles.island} ${open ? styles.open : ''}`}
      style={{ '--island-swatch': `url(${wallpaperUrl(active.id)})` }}
    >
      {/* Collapsed capsule */}
      <button
        type="button"
        className={styles.capsule}
        aria-expanded={open}
        aria-label={open ? 'Close wallpaper switcher' : `Wallpaper: ${active.name}. Open switcher`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.swatch} aria-hidden="true" />
        <span className={styles.capsuleLabel}>{active.name}</span>
        <span className={styles.chevron} aria-hidden="true">▾</span>
      </button>

      {/* Expanded panel */}
      <div className={styles.panel} role="dialog" aria-label="Choose a wallpaper" aria-hidden={!open}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.title}>{active.name}</span>
            <span className={styles.palette}>{active.palette}</span>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.action}
              aria-label="Shuffle wallpaper"
              title="Shuffle"
              tabIndex={open ? 0 : -1}
              onClick={shuffle}
            >
              🎲
            </button>
            <button
              type="button"
              className={styles.close}
              aria-label="Close"
              tabIndex={open ? 0 : -1}
              onClick={close}
            >
              ✕
            </button>
          </div>
        </div>

        <div
          className={styles.grid}
          role="listbox"
          aria-label="Wallpapers"
          onMouseLeave={clearPreview}
          onKeyDown={onGridKeyDown}
        >
          {wallpapers.map((wp, i) => {
            const isActive = wp.id === current;
            return (
              <button
                key={wp.id}
                ref={(el) => { thumbRefs.current[i] = el; }}
                type="button"
                role="option"
                aria-selected={isActive}
                aria-label={`${wp.name} — ${wp.palette}`}
                title={`${wp.name} — ${wp.palette}`}
                /* Roving tabindex: only the selected thumb is in the tab order. */
                tabIndex={open && i === sel ? 0 : -1}
                className={`${styles.thumb} ${isActive ? styles.active : ''}`}
                style={{
                  backgroundImage: `url(${wallpaperUrl(wp.id)})`,
                  // Stagger the reveal so thumbnails cascade in.
                  '--i': i,
                }}
                onMouseEnter={() => preview(wp.id)}
                onFocus={() => preview(wp.id)}
                onClick={() => onSelect(wp.id)}
              >
                {isActive && <span className={styles.check} aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
