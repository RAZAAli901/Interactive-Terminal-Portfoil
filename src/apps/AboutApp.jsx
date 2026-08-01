import styles from './AboutApp.module.css';

/** Skill chip cloud — spec README "Data (portfolio content)". */
const SKILLS = [
  'Python', 'PyTorch', 'LangChain', 'FAISS', 'YOLOv8', 'OpenCV',
  'NLP', 'RAG', 'SQL', 'Docker', 'FastAPI', 'Pandas',
];

const BIO =
  'I build practical machine-learning systems end to end — retrieval-augmented '
  + 'generation, computer-vision pipelines, and data-extraction ETL. I like turning '
  + 'messy real-world data into reliable, shippable tools.';

/**
 * `github` accepts either a bare handle ("RAZAAli901") or a full URL, so callers
 * can pass GITHUB_USER straight through without building the link themselves.
 */
function githubHref(github) {
  return /^https?:\/\//i.test(github) ? github : `https://github.com/${github}`;
}

/** Link label mirrors the markdown source: no protocol, no trailing slash. */
function githubLabel(github) {
  return githubHref(github).replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

/**
 * `~/about.md` window body — spec README "Window content → about".
 * Rendered as markdown *source*: the `#` / `##` prefixes stay visible in the
 * muted colour, and only the heading text carries the accent.
 */
export default function AboutApp({
  name = 'Raza Ali',
  role = 'AI / Machine Learning Engineer',
  bio = BIO,
  skills = SKILLS,
  github = 'RAZAAli901',
}) {
  return (
    <section className={styles.root} aria-label="about.md">
      <div className={styles.path}>~/about.md</div>

      <h1 className={styles.h1}>
        <span className={styles.hash} aria-hidden="true">#</span>
        {name}
      </h1>
      <p className={styles.role}>{role}</p>
      <p className={styles.bio}>{bio}</p>

      <h2 className={styles.h2} id="about-skills">
        <span className={styles.hash} aria-hidden="true">##</span>
        skills
      </h2>
      <ul className={styles.chips} aria-labelledby="about-skills">
        {skills.map((skill) => (
          <li key={skill} className={styles.chip}>{skill}</li>
        ))}
      </ul>

      <h2 className={styles.h2} id="about-contact">
        <span className={styles.hash} aria-hidden="true">##</span>
        contact
      </h2>
      <dl className={styles.contact} aria-labelledby="about-contact">
        <dt className={styles.key}>github</dt>
        <dd className={styles.value}>
          <a
            className={styles.link}
            href={githubHref(github)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {githubLabel(github)}
          </a>
        </dd>
        <dt className={styles.key}>focus</dt>
        <dd className={styles.value}>RAG · Computer Vision · Data Pipelines</dd>
      </dl>
    </section>
  );
}
