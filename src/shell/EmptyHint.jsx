import styles from './EmptyHint.module.css';

/** Separator dot between hint clauses — decorative, so it stays out of the a11y tree. */
function Sep() {
  return <span className={styles.sep} aria-hidden="true">·</span>;
}

/**
 * Bottom-center keybinding crib sheet, shown only on an empty desktop
 * (it occupies the space the dock would otherwise take).
 */
export default function EmptyHint({ visible }) {
  if (!visible) return null;

  return (
    <div className={styles.hint} role="note">
      <span className={styles.key}>ctrl+q</span> terminal
      <Sep />
      auto-tile
      <Sep />
      <span className={styles.gaps}>drag gaps</span> to resize
      <Sep />
      <span className={styles.titlebars}>drag titlebars</span> to swap
      <Sep />
      <span className={styles.glyph} aria-hidden="true">⊞</span> overview
    </div>
  );
}
