import { useCallback, useRef, useState } from 'react';

/**
 * Minimal mako/dunst-style notification queue. `notify()` pushes a toast that
 * auto-dismisses after `ttl` ms. IDs are monotonic (no Date/random needed).
 */
export function useNotifications(ttl = 4000) {
  const [items, setItems] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setItems((list) => list.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((title, text = '', icon = '\u{1F514}') => {
    const id = nextId.current;
    nextId.current += 1;
    setItems((list) => [...list, { id, title, text, icon }]);
    window.setTimeout(() => dismiss(id), ttl);
  }, [dismiss, ttl]);

  return { items, notify, dismiss };
}
