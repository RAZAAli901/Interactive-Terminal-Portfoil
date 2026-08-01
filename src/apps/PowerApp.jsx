import { GITHUB_USER } from '../data/projects';
import styles from './PowerApp.module.css';

const DEFAULT_GITHUB = `https://github.com/${GITHUB_USER}`;

/**
 * Power / logout window — the sign-off card behind the top bar's ⏻ button.
 * `github` is the profile URL; the label drops the scheme the way the design does.
 */
export default function PowerApp({ github = DEFAULT_GITHUB }) {
  const label = github.replace(/^https?:\/\//, '');

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.glyph} aria-hidden="true">⏻</div>
        <p className={styles.headline}>Thanks for stopping by.</p>
        <p className={styles.sub}>Reach out and let&apos;s build something.</p>
        <a
          className={styles.link}
          href={github}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label} ↗
        </a>
      </div>
    </div>
  );
}
