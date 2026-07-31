import { useEffect } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Trap keyboard focus within `ref` while `active`. Focuses the first focusable
 * element on activation and restores focus to the previously-focused element on
 * deactivation — so overlays (launcher, power menu, cheatsheet) are keyboard-safe.
 *
 * @param {boolean} active
 * @param {{ current: HTMLElement | null }} ref
 */
export function useFocusTrap(active, ref) {
  useEffect(() => {
    if (!active) return undefined;
    const container = ref.current;
    if (!container) return undefined;

    const previouslyFocused = document.activeElement;
    const focusable = () => Array.from(container.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);

    // Focus the first focusable element (or the container itself).
    const first = focusable()[0];
    (first || container).focus?.();

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [active, ref]);
}
