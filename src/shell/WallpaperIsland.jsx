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
export default function WallpaperIsland({ wallpapers, current, onSelect }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const active = getWallpaper(current);

  // Click-away + Escape close the island.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); } };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

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
        <span className={styles.capsuleLabel}>Wallpaper</span>
        <span className={styles.chevron} aria-hidden="true">▾</span>
      </button>

      {/* Expanded panel */}
      <div className={styles.panel} role="dialog" aria-label="Choose a wallpaper" aria-hidden={!open}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.title}>{active.name}</span>
            <span className={styles.palette}>{active.palette}</span>
          </div>
          <button
            type="button"
            className={styles.close}
            aria-label="Close"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className={styles.grid} role="listbox" aria-label="Wallpapers">
          {wallpapers.map((wp, i) => {
            const isActive = wp.id === current;
            return (
              <button
                key={wp.id}
                type="button"
                role="option"
                aria-selected={isActive}
                aria-label={`${wp.name} — ${wp.palette}`}
                title={`${wp.name} — ${wp.palette}`}
                tabIndex={open ? 0 : -1}
                className={`${styles.thumb} ${isActive ? styles.active : ''}`}
                style={{
                  backgroundImage: `url(${wallpaperUrl(wp.id)})`,
                  // Stagger the reveal so thumbnails cascade in.
                  '--i': i,
                }}
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
