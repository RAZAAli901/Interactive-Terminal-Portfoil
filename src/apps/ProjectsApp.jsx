import { PROJECTS } from '../data/projects';
import styles from './ProjectsApp.module.css';

/**
 * `projects` window body — spec README "Window content → projects".
 * Purely presentational: clicking a card reports its index and the shell
 * decides what to do with it (open the browser window on that repo).
 */
export default function ProjectsApp({ projects = PROJECTS, onOpenProject }) {
  const items = Array.isArray(projects) ? projects : [];

  return (
    <div className={styles.root}>
      <div className={styles.prompt}>
        $ ls ~/projects <span className={styles.note}>— click to open in browser</span>
      </div>

      <ul className={styles.list}>
        {items.map((project, index) => (
          <li key={project.name ?? index}>
            <button
              type="button"
              className={styles.card}
              /* Passed as a custom property, not `border-left-color`, so the
                 :hover rule can still override the accent border. */
              style={{ '--proj-color': project.color }}
              aria-label={`Open ${project.name}`}
              onClick={() => onOpenProject?.(index)}
            >
              <span className={styles.title}>
                <span className={styles.diamond} aria-hidden="true">◆</span>
                {project.name}
              </span>
              <span className={styles.desc}>{project.desc}</span>
              <span className={styles.tags}>
                {(project.tags ?? []).map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
