import styles from './FilesApp.module.css';
import { PROJECTS } from '../data/projects';

/**
 * Files window — spec README "Window content → files".
 *
 * A Thunar-ish view of `~/projects`: one folder tile per project (glyph tinted
 * with the project color) plus a static resume.pdf file tile. Presentational —
 * the window manager owns what "open this project" actually does.
 */
export default function FilesApp({ projects = PROJECTS, onOpenProject }) {
  const items = Array.isArray(projects) ? projects : [];

  return (
    <div className={styles.root}>
      <div className={styles.breadcrumb}>
        <span className={styles.crumbIcon} aria-hidden="true">{'\u{1F5C0}'}</span>
        <span className={styles.home}>~</span>
        <span className={styles.sep}>/</span>
        <span>projects</span>
      </div>

      <ul className={styles.grid} aria-label="Contents of ~/projects">
        {items.map((project, index) => {
          const name = project.name ?? project.title ?? `project-${index + 1}`;
          return (
            <li key={project.id ?? name ?? index}>
              <button
                type="button"
                className={styles.tile}
                aria-label={`Open ${name}`}
                onClick={() => onOpenProject?.(index)}
              >
                <span
                  className={styles.glyph}
                  style={{ color: project.color || 'var(--hypr-accent, #7aa2f7)' }}
                  aria-hidden="true"
                >
                  {'\u{1F5C0}'}
                </span>
                <span className={styles.name}>{name}</span>
              </button>
            </li>
          );
        })}

        {/* Decorative: the resume file is part of the folder listing, not a control. */}
        <li>
          <div className={`${styles.tile} ${styles.fileTile}`}>
            <span className={styles.glyph} aria-hidden="true">{'\u{1F5CB}'}</span>
            <span className={styles.name}>resume.pdf</span>
          </div>
        </li>
      </ul>
    </div>
  );
}
