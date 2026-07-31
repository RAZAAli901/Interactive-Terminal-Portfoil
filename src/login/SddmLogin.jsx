import { useEffect, useRef, useState } from 'react';
import styles from './SddmLogin.module.css';

/**
 * SDDM-style login screen. Decorative only — the password field collects nothing
 * and submits nowhere; any value (or none) and Enter/click proceeds to the
 * desktop. `wallpaper` is blurred behind the card.
 */
export default function SddmLogin({ wallpaper, user = 'razaali', onLogin }) {
  const [pw, setPw] = useState('');
  const [time, setTime] = useState(new Date());
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => clearInterval(id);
  }, []);

  const login = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onLogin, 300);
  };

  const onKeyDown = (e) => { if (e.key === 'Enter') login(); };

  return (
    <div className={`${styles.screen} ${leaving ? styles.fadeOut : ''}`}>
      <div className={styles.bg} style={wallpaper ? { backgroundImage: `url(${wallpaper})` } : undefined} />
      <div className={styles.scrim} />

      <div className={styles.clock}>
        <div className={styles.time}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
        <div className={styles.date}>{time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className={styles.card}>
        <div className={styles.avatar} aria-hidden="true">{'\u{1F464}'}</div>
        <div className={styles.user}>{user}</div>
        <div className={styles.field}>
          <input
            ref={inputRef}
            className={styles.input}
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Password"
            aria-label="Password (demo — any value works)"
          />
          <button className={styles.go} onClick={login} aria-label="Log in">→</button>
        </div>
        <div className={styles.hint}>demo login — press Enter to continue</div>
      </div>

      <div className={styles.session}>
        <span>Session</span>
        <span className={styles.pill}>Hyprland</span>
      </div>
    </div>
  );
}
