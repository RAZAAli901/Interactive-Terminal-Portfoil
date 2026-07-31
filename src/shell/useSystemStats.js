import { useEffect, useState } from 'react';

/** Clamp helper. */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Simulated system telemetry for the waybar (CPU / RAM / network / etc.).
 * Values drift with a small random walk so the bar feels alive without ever
 * pretending to be real hardware readings.
 *
 * @param {number} [intervalMs=2000]
 */
export function useSystemStats(intervalMs = 2000) {
  const [stats, setStats] = useState({
    cpu: 12, ram: 38, netDown: 1.2, netUp: 0.3, temp: 46, volume: 65, battery: 82,
  });

  useEffect(() => {
    const walk = (v, step, lo, hi) => clamp(v + (Math.random() - 0.5) * step, lo, hi);
    const id = setInterval(() => {
      setStats((s) => ({
        cpu: Math.round(walk(s.cpu, 18, 3, 96)),
        ram: Math.round(walk(s.ram, 6, 22, 88)),
        netDown: Number(walk(s.netDown, 2.5, 0, 12).toFixed(1)),
        netUp: Number(walk(s.netUp, 1.2, 0, 6).toFixed(1)),
        temp: Math.round(walk(s.temp, 4, 38, 78)),
        volume: s.volume,
        battery: s.battery,
      }));
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return stats;
}
