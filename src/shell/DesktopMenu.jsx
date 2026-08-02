import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { wallpaperUrl } from '../data/wallpapers';
import styles from './DesktopMenu.module.css';

/**
 * Right-click desktop menu focused on wallpapers: quick actions (shuffle / next)
 * plus a swatch grid to pick any wallpaper directly. Positioned at the cursor
 * and clamped inside the viewport; dismisses on click-away, scroll or Escape.
 */
export default function DesktopMenu({ x, y, wallpapers, current, onSelect, onShuffle, onNext, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y });

  // Keep the menu fully on screen.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setPos({
      left: Math.min(x, window.innerWidth - width - 8),
      top: Math.min(y, window.innerHeight - height - 8),
    });
  }, [x, y]);

  useEffect(() => {
    const onDown = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onClose, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onClose, true);
    };
  }, [onClose]);

  const pick = (id) => { onSelect(id); onClose(); };

  return (
    <div ref={ref} className={styles.menu} style={pos} role="menu" aria-label="Desktop">
      <button type="button" role="menuitem" className={styles.item} onClick={() => { onShuffle(); onClose(); }}>
        <span className={styles.glyph} aria-hidden="true">🎲</span> Shuffle wallpaper
      </button>
      <button type="button" role="menuitem" className={styles.item} onClick={() => { onNext(); onClose(); }}>
        <span className={styles.glyph} aria-hidden="true">→</span> Next wallpaper
      </button>
      <div className={styles.sep} />
      <div className={styles.heading}>Wallpaper</div>
      <div className={styles.swatches} role="listbox" aria-label="Wallpapers">
        {wallpapers.map((wp) => (
          <button
            key={wp.id}
            type="button"
            role="option"
            aria-selected={wp.id === current}
            aria-label={`${wp.name} — ${wp.palette}`}
            title={`${wp.name} — ${wp.palette}`}
            className={`${styles.swatch} ${wp.id === current ? styles.active : ''}`}
            style={{ backgroundImage: `url(${wallpaperUrl(wp.id)})` }}
            onClick={() => pick(wp.id)}
          />
        ))}
      </div>
    </div>
  );
}
