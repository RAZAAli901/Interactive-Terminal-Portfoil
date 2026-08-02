import { useEffect, useRef } from 'react';

/**
 * Fire `onAdvance` every `intervalMs` while `enabled`.
 *
 * The callback is read from a ref, so the timer is only re-created when the
 * enabled flag or interval actually change — advancing the wallpaper every tick
 * does not restart the clock.
 *
 * @param {boolean} enabled
 * @param {number} intervalMs
 * @param {() => void} onAdvance
 */
export function useSlideshow(enabled, intervalMs, onAdvance) {
  const cb = useRef(onAdvance);
  cb.current = onAdvance;

  useEffect(() => {
    if (!enabled || !(intervalMs > 0)) return undefined;
    const id = setInterval(() => cb.current(), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs]);
}
