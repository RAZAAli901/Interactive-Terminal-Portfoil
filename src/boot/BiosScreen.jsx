import { useEffect, useState } from 'react';
import styles from './BiosScreen.module.css';

/**
 * Fake BIOS / POST screen. Counts up a memory test, "detects" drives, then
 * advances. Any key or click skips ahead.
 */
export default function BiosScreen({ onDone }) {
  const [mem, setMem] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const total = 32768; // 32 GB in MB

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onDone, 220);
  };

  useEffect(() => {
    // Ramp the memory counter, then hold briefly before advancing.
    const step = total / 22;
    const id = setInterval(() => {
      setMem((m) => {
        const next = m + step;
        if (next >= total) { clearInterval(id); setTimeout(finish, 500); return total; }
        return next;
      });
    }, 45);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('click', skip);
    return () => { window.removeEventListener('keydown', skip); window.removeEventListener('click', skip); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving]);

  return (
    <div className={`${styles.screen} ${leaving ? styles.fadeOut : ''}`} onClick={finish}>
      <div className={styles.head}>American Megatrends Inc.</div>
      <div className={styles.dim}>ASUS ROG STRIX B550-F · BIOS Revision 3.14</div>
      <div className={styles.dim}>AMD Ryzen 9 5900X 12-Core Processor</div>

      <div className={styles.rows}>
        <div className={styles.row}>Memory Test : <span className={styles.amber}>{Math.round(mem).toLocaleString()}M</span> / {total.toLocaleString()}M OK</div>
        <div className={styles.row}>{mem >= total ? 'Detecting IDE drives ...  ' : ''}<span className={styles.amber}>{mem >= total ? 'NVMe0: Samsung SSD 980 PRO 1TB' : ''}</span></div>
        <div className={styles.row}>{mem >= total ? 'Initializing USB Controllers ...  Done' : ''}</div>
      </div>

      <div className={styles.foot}>
        <span>Press <span className={styles.amber}>DEL</span> to enter SETUP</span>
        <span className={styles.blink}>Booting Arch Linux from NVMe0 ▂</span>
      </div>
    </div>
  );
}
