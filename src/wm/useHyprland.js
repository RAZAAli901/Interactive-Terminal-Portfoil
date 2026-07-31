import { useCallback, useMemo, useState } from 'react';

/**
 * Hyprland-style window manager state.
 *
 * Supersedes the original useWindowManager: adds active-window tracking (for the
 * focused gradient border) and a per-window floating flag (for the tiling/float
 * toggle). Tiling layout + workspaces land in a later phase; the open/close/
 * focus/z-index contract stays compatible so existing callers keep working.
 *
 * @param {Record<string, object>} initialWindows
 */
export function useHyprland(initialWindows) {
  const [, setMaxZIndex] = useState(10);
  const [windows, setWindows] = useState(initialWindows);
  const [activeId, setActiveId] = useState(
    () => Object.values(initialWindows).find((w) => w.isOpen && !w.isMinimized)?.id ?? null,
  );

  /** Highest-z open, non-minimized window — used to reassign focus. */
  const topWindowId = useCallback((wins, excludeId) => {
    let best = null;
    let bestZ = -Infinity;
    for (const w of Object.values(wins)) {
      if (!w.isOpen || w.isMinimized || w.id === excludeId) continue;
      if (w.zIndex > bestZ) { bestZ = w.zIndex; best = w.id; }
    }
    return best;
  }, []);

  const openWindow = useCallback((id) => {
    setMaxZIndex((z) => {
      const nextZ = z + 1;
      setWindows((prev) => ({
        ...prev,
        [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: nextZ },
      }));
      return nextZ;
    });
    setActiveId(id);
  }, []);

  const closeWindow = useCallback((id) => {
    setWindows((prev) => {
      const next = { ...prev, [id]: { ...prev[id], isOpen: false, isMinimized: false } };
      setActiveId((cur) => (cur === id ? topWindowId(next) : cur));
      return next;
    });
  }, [topWindowId]);

  const minimizeWindow = useCallback((id) => {
    setWindows((prev) => {
      const next = { ...prev, [id]: { ...prev[id], isMinimized: true } };
      setActiveId((cur) => (cur === id ? topWindowId(next) : cur));
      return next;
    });
  }, [topWindowId]);

  const focusWindow = useCallback((id) => {
    setMaxZIndex((z) => {
      const nextZ = z + 1;
      setWindows((prev) => ({ ...prev, [id]: { ...prev[id], zIndex: nextZ } }));
      return nextZ;
    });
    setActiveId(id);
  }, []);

  const toggleWindow = useCallback((id) => {
    setWindows((prev) => {
      const win = prev[id];
      if (!win) return prev;
      if (!win.isOpen || win.isMinimized) {
        setMaxZIndex((z) => {
          const nextZ = z + 1;
          setWindows((p) => ({ ...p, [id]: { ...p[id], isOpen: true, isMinimized: false, zIndex: nextZ } }));
          return nextZ;
        });
        setActiveId(id);
        return prev;
      }
      const next = { ...prev, [id]: { ...win, isMinimized: true } };
      setActiveId((cur) => (cur === id ? topWindowId(next) : cur));
      return next;
    });
  }, [topWindowId]);

  /** Toggle floating vs tiled for a window. */
  const toggleFloating = useCallback((id) => {
    setWindows((prev) => ({ ...prev, [id]: { ...prev[id], floating: !prev[id].floating } }));
  }, []);

  const api = useMemo(() => ({
    windows, activeId,
    openWindow, closeWindow, minimizeWindow, toggleWindow, focusWindow, toggleFloating,
  }), [windows, activeId, openWindow, closeWindow, minimizeWindow, toggleWindow, focusWindow, toggleFloating]);

  return api;
}
