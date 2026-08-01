import { GITHUB_USER, PROJECTS, cloneUrl, repoUrl } from '../data/projects';
import styles from './BrowserApp.module.css';

/** Firefox-style nav glyphs. `key` is handed straight back through onNavigate. */
const NAV_BUTTONS = [
  { key: 'back', glyph: '←', label: 'Back' },
  { key: 'forward', glyph: '→', label: 'Forward' },
  { key: 'reload', glyph: '↻', label: 'Reload' },
];

/**
 * Browser window content — Firefox chrome over a GitHub repo page.
 *
 * Controlled: the window manager owns which project is shown. `onNavigate` is
 * called with 'back' | 'forward' | 'reload'; when it is absent the nav glyphs
 * render disabled rather than as focusable no-ops.
 */
export default function BrowserApp({ projectIndex = 0, onNavigate }) {
  const project = PROJECTS[projectIndex] || PROJECTS[0];
  const href = repoUrl(project.name);
  const clone = cloneUrl(project.name);
  // The URL pill shows the bare host+path the way a browser omits the scheme.
  const displayUrl = href.replace(/^https:\/\//, '');

  return (
    <div className={styles.root}>
      <div className={styles.chrome}>
        <div className={styles.nav}>
          {NAV_BUTTONS.map((b) => (
            <button
              key={b.key}
              type="button"
              className={styles.navButton}
              aria-label={b.label}
              disabled={!onNavigate}
              onClick={() => onNavigate?.(b.key)}
            >
              <span aria-hidden="true">{b.glyph}</span>
            </button>
          ))}
        </div>
        <div className={styles.urlPill}>
          <span className={styles.lock} aria-hidden="true">🔒</span>
          <span className={styles.url}>{displayUrl}</span>
        </div>
      </div>

      <div className={styles.page}>
        <div className={styles.repoHead}>
          <span className={styles.diamond} style={{ color: project.color }} aria-hidden="true">◆</span>
          <h2 className={styles.repoTitle}>
            {GITHUB_USER} / <span className={styles.repoName}>{project.name}</span>
          </h2>
        </div>

        <ul className={styles.tags}>
          {project.tags.map((tag) => (
            <li key={tag} className={styles.tag}>{tag}</li>
          ))}
        </ul>

        <p className={styles.desc}>{project.desc}</p>

        <div className={styles.cloneLabel}>Clone this repository</div>
        <pre className={styles.clone}>$ git clone {clone}</pre>

        <div className={styles.readme}>
          <h3 className={styles.readmeTitle}># {project.name}</h3>
          <p className={styles.readmeBody}>{project.readme}</p>
          <a
            className={styles.cta}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub ↗
          </a>
        </div>
      </div>
    </div>
  );
}
