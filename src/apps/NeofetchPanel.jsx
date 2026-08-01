import styles from './NeofetchPanel.module.css';

/**
 * Classic Arch "mountain A". Hand-laid rather than generated so the outer walls,
 * the notch that splits the two feet, and the flared base all stay column-aligned
 * in a monospace face. 16 rows, 33 columns wide.
 */
const ARCH_LOGO = [
  '                /\\',
  '               /  \\',
  '              /    \\',
  '             /      \\',
  '            /        \\',
  '           /          \\',
  '          /            \\',
  '         /              \\',
  '        /                \\',
  '       /        /\\        \\',
  '      /        /  \\        \\',
  '     /        /    \\        \\',
  '    /        /      \\        \\',
  '   /        /        \\        \\',
  '  /        /          \\        \\',
  ' /________/            \\________\\',
].join('\n');

/** Tokyo Night red / orange / green / cyan / blue / purple. */
const CHIPS = [
  'var(--hypr-red, #f7768e)',
  'var(--hypr-yellow, #e0af68)',
  'var(--hypr-green, #9ece6a)',
  'var(--hypr-info, #7dcfff)',
  'var(--hypr-accent, #7aa2f7)',
  'var(--hypr-accent-2, #bb9af7)',
];

const DEFAULT_BIO =
  'AI/ML engineer building RAG systems, vision models and data pipelines.';

/**
 * The neofetch card that heads the terminal window: ASCII distro logo beside a
 * key/value system summary, a palette strip, and a live-looking shell prompt.
 * Purely presentational — every string is a prop or a constant.
 */
export default function NeofetchPanel({
  name = 'Raza Ali',
  role = 'AI / ML Engineer',
  bio = DEFAULT_BIO,
}) {
  // `raza@arch` — the shell user tracks the name so the card stays consistent.
  const user = String(name).trim().split(/\s+/)[0].toLowerCase() || 'user';

  const rows = [
    ['OS', 'Arch Linux x86_64'],
    ['Host', 'Portfolio Desktop'],
    ['Kernel', '6.9.4-arch1'],
    ['Shell', 'zsh 5.9'],
    ['WM', 'Hyprland (dwindle)'],
    ['Terminal', 'kitty'],
    ['Role', role],
    ['Stack', 'Python · PyTorch · LangChain'],
  ];

  return (
    <section className={styles.panel} aria-label="neofetch system summary">
      <div className={styles.top}>
        <pre className={styles.logo} aria-hidden="true">{ARCH_LOGO}</pre>

        <div className={styles.info}>
          <div className={styles.user}>
            {user}
            <span className={styles.at}>@</span>
            arch
          </div>
          <div className={styles.rule} aria-hidden="true">─────────────────</div>

          <dl className={styles.rows}>
            {rows.map(([key, value]) => (
              <div className={styles.row} key={key}>
                <dt className={styles.key}>{key}</dt>
                <dd className={styles.value}>{value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.chips} aria-hidden="true">
            {CHIPS.map((color) => (
              <span className={styles.chip} key={color} style={{ background: color }} />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.cmd}>
        $ <span className={styles.cmdName}>whoami</span>
      </div>
      <p className={styles.bio}>{bio}</p>

      <div className={styles.prompt}>
        <span className={styles.promptUser}>{user}@arch</span>
        <span className={styles.punct}>:</span>
        <span className={styles.path}>~</span>
        <span className={styles.punct}>$</span>{' '}
        <span className={styles.cursor} aria-hidden="true" />
      </div>
    </section>
  );
}
