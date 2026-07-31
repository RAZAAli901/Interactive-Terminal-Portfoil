import { useEffect, useState } from 'react';

/**
 * Slim top bar for the mobile terminal-first view. Tiling doesn't translate to
 * phones, so mobile gets a focused kitty terminal under a minimal status strip.
 */
export default function MobileBar() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        height: 36,
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        color: 'var(--hypr-subtext, #a6adc8)',
        background: 'var(--hypr-mantle, #181825)',
        borderBottom: '1px solid var(--hypr-border, #45475a)',
      }}
    >
      <span style={{ color: 'var(--hypr-accent, #cba6f7)', fontWeight: 600 }}>razaali@arch</span>
      <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
    </div>
  );
}
