import { useEffect, useState } from 'react';
import { useSystemStats } from './useSystemStats';
import styles from './Waybar.module.css';

const WORKSPACES = [1, 2, 3, 4, 5];

/** Minimal Arch Linux logo mark. */
function ArchLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c-1.4 3-2.3 5-3 6.6.9.8 2 1.7 3.7 2.7-1.9-.8-3.2-1.5-4.2-2.4-1.9 4-4.8 9.8-5.5 11.1 2.2-1.3 3.9-2 5.5-2.3-.1-.3-.1-.7-.1-1v-.1c0-1.6 1-2.9 2.1-2.9s2.1 1.3 2.1 2.9c0 .4 0 .7-.1 1 1.6.3 3.3 1 5.5 2.3C19.5 18.4 13.4 5 12 2z" />
    </svg>
  );
}

/**
 * Top status bar (waybar). Left: Arch launcher + workspace pills + focused
 * window title. Center: clock. Right: system telemetry + power.
 */
export default function Waybar({
  activeWorkspace = 1,
  occupied = new Set(),
  onWorkspace,
  focusedTitle = '',
  onLauncher,
  onPower,
}) {
  const stats = useSystemStats();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className={styles.bar} aria-label="Status bar">
      <div className={styles.group}>
        <button className={styles.arch} onClick={onLauncher} title="Applications (Super+D)" aria-label="Open application launcher">
          <ArchLogo />
        </button>
        <div
          className={styles.workspaces}
          role="tablist"
          aria-label="Workspaces"
          onWheel={(e) => {
            const dir = e.deltaY > 0 ? 1 : -1;
            onWorkspace?.(Math.min(5, Math.max(1, activeWorkspace + dir)));
          }}
        >
          {WORKSPACES.map((n) => (
            <button
              key={n}
              role="tab"
              aria-selected={n === activeWorkspace}
              className={[
                styles.ws,
                n === activeWorkspace ? styles.active : '',
                occupied.has(n) ? styles.occupied : '',
              ].join(' ')}
              onClick={() => onWorkspace?.(n)}
              title={`Workspace ${n}`}
              aria-label={`Workspace ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
        <span className={styles.module} title="Layout" aria-label="Tiling layout: dwindle">◫ dwindle</span>
        {focusedTitle && <span className={styles.title}>{focusedTitle}</span>}
      </div>

      <div className={`${styles.group} ${styles.center}`}>
        <span className={styles.clock}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          <span className={styles.date}>{time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </span>
      </div>

      <div className={`${styles.group} ${styles.right}`}>
        <span className={`${styles.module} ${styles.metric} ${styles.cpu}`} title="CPU load">
          CPU <span className={styles.val}>{stats.cpu}%</span>
        </span>
        <span className={`${styles.module} ${styles.metric} ${styles.ram}`} title="Memory usage">
          RAM <span className={styles.val}>{stats.ram}%</span>
        </span>
        <span className={`${styles.module} ${styles.metric} ${styles.temp}`} title="CPU temperature">
          <span className={styles.val}>{stats.temp}°C</span>
        </span>
        <span className={`${styles.module} ${styles.metric}`} title="Network down (Mbps)">
          ↓ <span className={styles.val}>{stats.netDown}</span>
        </span>
        <span className={styles.module} title="Volume">🔊 {stats.volume}%</span>
        <span className={styles.module} title="Battery">🔋 {stats.battery}%</span>
        <button className={styles.power} onClick={onPower} title="Power (Super+Esc)" aria-label="Power menu">⏻</button>
      </div>
    </nav>
  );
}
