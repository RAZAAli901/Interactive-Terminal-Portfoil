import { useEffect, useRef, useState } from 'react';
import styles from './SystemdBoot.module.css';

// Each entry: [status, message]. status drives the colored tag.
const SERVICES = [
  ['ok', 'Started Load Kernel Modules'],
  ['ok', 'Mounted /boot EFI System Partition'],
  ['ok', 'Reached target Local File Systems'],
  ['ok', 'Started Journal Service'],
  ['ok', 'Started udev Kernel Device Manager'],
  ['ok', 'Started Network Manager'],
  ['ok', 'Reached target Network'],
  ['ok', 'Started Bluetooth service'],
  ['ok', 'Started WirePlumber Multimedia Service'],
  ['ok', 'Started Authorization Manager (polkit)'],
  ['ok', 'Reached target Sound Card'],
  ['ok', 'Started TLP system startup/shutdown'],
  ['ok', 'Started Simple Desktop Display Manager (sddm)'],
  ['ok', 'Reached target Graphical Interface'],
];

/**
 * systemd-style boot log: green [  OK  ] lines stream in, then hands off to the
 * display manager. Any key/click skips to the end.
 */
export default function SystemdBoot({ onDone }) {
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const bottomRef = useRef(null);

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onDone, 220);
  };

  useEffect(() => {
    if (count >= SERVICES.length) { const t = setTimeout(finish, 450); return () => clearTimeout(t); }
    const t = setTimeout(() => setCount((c) => c + 1), 90 + Math.random() * 70);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useEffect(() => { bottomRef.current?.scrollIntoView?.(); }, [count]);

  useEffect(() => {
    const skip = () => setCount(SERVICES.length);
    window.addEventListener('keydown', skip);
    window.addEventListener('click', skip);
    return () => { window.removeEventListener('keydown', skip); window.removeEventListener('click', skip); };
  }, []);

  return (
    <div className={`${styles.screen} ${leaving ? styles.fadeOut : ''}`}>
      <div className={styles.line}><span className={styles.dim}>Arch Linux 6.9.7-arch1-1 (tty1)</span></div>
      <div className={styles.line}>{' '}</div>
      {SERVICES.slice(0, count).map(([status, msg], i) => (
        <div className={styles.line} key={i}>
          <span className={styles.bracket}>[ </span>
          <span className={status === 'ok' ? styles.ok : styles.warn}>{status === 'ok' ? ' OK ' : 'WARN'}</span>
          <span className={styles.bracket}> ] </span>
          {msg}
        </div>
      ))}
      {count >= SERVICES.length && (
        <div className={styles.line}><span className={styles.info}>Starting SDDM…</span> <span className={styles.cursor}>▂</span></div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
