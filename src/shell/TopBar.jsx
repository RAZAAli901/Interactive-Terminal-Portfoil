import { useEffect, useState } from 'react';
import { useSystemStats } from './useSystemStats';
import styles from './TopBar.module.css';

const WORKSPACES = [1, 2, 3, 4, 5];

/** Stable identity so the default prop never re-triggers effects downstream. */
const NO_WORKSPACES = new Set();

const clampWs = (n) => Math.min(WORKSPACES.length, Math.max(1, n));

/** 24h `HH:MM` — en-GB zero-pads the hour. */
const fmtTime = (d) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/** `Ddd D Mon`, e.g. "Fri 1 Aug". */
function fmtDate(d) {
  const wd = d.toLocaleDateString('en-US', { weekday: 'short' });
  const mo = d.toLocaleDateString('en-US', { month: 'short' });
  return `${wd} ${d.getDate()} ${mo}`;
}

/**
 * Hyprland-style top status bar. Left: workspace pills + overview + layout
 * toggle. Center: clock. Right: telemetry pills + power.
 *
 * Purely presentational — workspace / layout / window state belong to the
 * window manager; this only renders them and reports intent back. The only
 * local state is the clock tick.
 */
export default function TopBar({
  activeWorkspace = 1,
  occupied = NO_WORKSPACES,
  onWorkspace,
  focusedTitle = '',
  layout = 'dwindle',
  onToggleLayout,
  onOverview,
  onPower,
  stats: statsOverride,
}) {
  const [now, setNow] = useState(() => new Date());
  // Telemetry is sourced here rather than in App: its 2s tick would otherwise
  // re-render the whole window tree. Tests can still inject fixed values.
  const liveStats = useSystemStats();
  const stats = statsOverride ?? liveStats;

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Match the dwindle name explicitly: an unrecognised value should not
  // silently read as tiling.
  const tiling = layout === 'dwindle';
  // useSystemStats() names the download rate `netDown`; accept either key.
  const net = stats.net ?? stats.netDown ?? 0;
  const volume = stats.volume ?? 65;

  return (
    <nav className={styles.bar} aria-label="Status bar">
      <div className={styles.left}>
        <div
          className={styles.workspaces}
          role="tablist"
          aria-label="Workspaces"
          onWheel={(e) => {
            const next = clampWs(activeWorkspace + (e.deltaY > 0 ? 1 : -1));
            if (next === activeWorkspace) return;
            e.preventDefault();
            onWorkspace?.(next);
          }}
        >
          {WORKSPACES.map((n) => (
            <button
              key={n}
              type="button"
              role="tab"
              aria-selected={n === activeWorkspace}
              aria-label={`Workspace ${n}`}
              title={`Workspace ${n}`}
              className={[
                styles.ws,
                occupied.has(n) ? styles.occupied : '',
                n === activeWorkspace ? styles.active : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onWorkspace?.(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.overview}
          onClick={onOverview}
          title="Window overview (Ctrl+`)"
          aria-label="Toggle window overview"
        >
          ⊞
        </button>

        <button
          type="button"
          className={styles.layout}
          onClick={onToggleLayout}
          aria-pressed={tiling}
          aria-label="Toggle tiling layout"
          title="Toggle tiling / floating"
        >
          <span className={styles.layoutGlyph} aria-hidden="true">▤</span>
          <span className={styles.layoutName}>{tiling ? 'dwindle' : 'floating'}</span>
        </button>

        {focusedTitle && <span className={styles.title}>{focusedTitle}</span>}
      </div>

      <div className={styles.center}>
        <time className={styles.clock} dateTime={now.toISOString()}>
          <span className={styles.timeVal}>{fmtTime(now)}</span>
          <span className={styles.dateVal}>{fmtDate(now)}</span>
        </time>
      </div>

      <div className={styles.right}>
        <div className={styles.stats}>
          <span className={styles.pill} title="CPU load">
            <span className={styles.label}>CPU</span>
            <span className={styles.cpu}>{stats.cpu ?? 0}%</span>
          </span>
          <span className={styles.pill} title="Memory usage">
            <span className={styles.label}>RAM</span>
            <span className={styles.ram}>{stats.ram ?? 0}%</span>
          </span>
          <span className={styles.pill} title="CPU temperature">
            <span className={styles.temp}>{stats.temp ?? 0}°C</span>
          </span>
          <span className={styles.pill} title="Network down">
            <span className={styles.srOnly}>Network down</span>
            <span className={styles.label} aria-hidden="true">▼</span>
            <span className={styles.net}>{net}</span>
          </span>
          <span className={styles.pill} title="Volume">
            <span className={styles.srOnly}>Volume</span>
            <span className={styles.label} aria-hidden="true">🔊</span>
            <span className={styles.vol}>{volume}%</span>
          </span>
          <span className={styles.pill} title="Battery">
            <span className={styles.srOnly}>Battery</span>
            <span className={styles.batt}>
              <span aria-hidden="true">🔋</span> {stats.battery ?? 0}%
            </span>
          </span>
        </div>

        <button
          type="button"
          className={styles.power}
          onClick={onPower}
          title="Power (Super+Esc)"
          aria-label="Power menu"
        >
          ⏻
        </button>
      </div>
    </nav>
  );
}
