import styles from './LauncherColumn.module.css';

/**
 * Desktop launcher entries — spec README "2. Desktop launcher icons".
 * `mono` renders the hand-typed glyphs (>_, </>, i) in JetBrains Mono; `size`
 * is the per-glyph font-size the design uses to optically balance each tile.
 */
const ITEMS = [
  { app: 'terminal', label: 'kitty', glyph: '>_', color: 'var(--hypr-info, #7dcfff)', size: 18, mono: true },
  { app: 'files', label: 'Files', glyph: '\u{1F5C0}', color: 'var(--hypr-yellow, #e0af68)', size: 22 },
  { app: 'browser', label: 'Firefox', glyph: '\u{1F310}', color: 'var(--hypr-red, #f7768e)', size: 22 },
  { app: 'code', label: 'Code', glyph: '</>', color: 'var(--hypr-accent, #7aa2f7)', size: 17, mono: true },
  { app: 'about', label: 'about.md', glyph: 'i', color: 'var(--hypr-accent-2, #bb9af7)', size: 20, mono: true, italic: true },
  { app: 'projects', label: 'projects', glyph: '◆', color: 'var(--hypr-green, #9ece6a)', size: 20 },
];

/**
 * Left-hand desktop launcher column. Single click launches — this is a launcher
 * bar, not a desktop icon grid, so no double-click. Hidden on small viewports.
 */
export default function LauncherColumn({ onLaunch }) {
  return (
    <div className={styles.column} role="group" aria-label="Desktop launcher">
      {ITEMS.map((item) => (
        <button
          key={item.app}
          type="button"
          className={styles.item}
          aria-label={`Launch ${item.label}`}
          onClick={() => onLaunch?.(item.app)}
        >
          <span
            className={[styles.tile, item.mono && styles.mono, item.italic && styles.italic].filter(Boolean).join(' ')}
            style={{ color: item.color, fontSize: `${item.size}px` }}
            aria-hidden="true"
          >
            {item.glyph}
          </span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
