import { useEffect, useRef } from 'react';

/**
 * Hyprland-style keyboard shortcuts.
 *
 * The `Super` key is the browser's Meta key (⌘ / Windows key). We also accept
 * Alt as a fallback for keyboards/OSes that swallow Meta combos. Handlers are
 * passed by name; only the ones provided are bound, so callers wire what they
 * support in the current phase.
 *
 * Recognised actions:
 *   launcher      Super+D            toggle the app launcher
 *   terminal      Super+Return       open a terminal
 *   closeActive   Super+Q            close the focused window
 *   toggleFloat   Super+Space        float/tile the focused window
 *   fullscreen    Super+F            maximize/restore the focused window
 *   workspace     Super+[1-5]        switch workspace (arg = number)
 *   cheatsheet    Super+/            toggle the keybind cheatsheet
 *   powerMenu     Super+Escape       open the power menu
 *
 * @param {Record<string, (arg?: any) => void>} handlers
 * @param {{ enabled?: boolean }} [opts]
 */
export function useKeybindings(handlers, { enabled = true } = {}) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    if (!enabled) return undefined;

    const onKeyDown = (e) => {
      const sup = e.metaKey || e.altKey;
      if (!sup) return;
      const h = ref.current;
      const key = e.key;

      // Workspace switching: Super+1..5 (Super+Shift+1..5 moves the window).
      if (/^[1-5]$/.test(key)) {
        if (e.shiftKey && h.moveWorkspace) { e.preventDefault(); h.moveWorkspace(Number(key)); }
        else if (h.workspace) { e.preventDefault(); h.workspace(Number(key)); }
        return;
      }

      const map = {
        d: 'launcher',
        q: 'closeActive',
        f: 'fullscreen',
        j: 'focusNext',
        k: 'focusPrev',
        p: 'screenshot',
        ' ': 'toggleFloat',
        Enter: 'terminal',
        '/': 'cheatsheet',
        Escape: 'powerMenu',
      };
      const action = map[key] || map[key.toLowerCase?.()];
      if (action && h[action]) {
        e.preventDefault();
        h[action]();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
