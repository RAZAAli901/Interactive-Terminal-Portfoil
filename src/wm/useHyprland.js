import { useCallback, useMemo, useState } from 'react';

/** Windows that spawn floating by default (utilities look wrong tiled full-height). */
const FLOAT_BY_DEFAULT = new Set(['calculator', 'clock', 'settings', 'snipping']);

/** Add workspace/floating defaults to the initial window map. */
function normalize(initialWindows) {
  const out = {};
  for (const [id, w] of Object.entries(initialWindows)) {
    out[id] = { workspace: 1, floating: FLOAT_BY_DEFAULT.has(id), ...w };
  }
  return out;
}

/**
 * Hyprland-style window manager state: open/close/focus, active-window tracking,
 * per-window floating flag, and 5 virtual workspaces with switch + move.
 *
 * @param {Record<string, object>} initialWindows
 */
export function useHyprland(initialWindows) {
  const [, setMaxZIndex] = useState(10);
  const [windows, setWindows] = useState(() => normalize(initialWindows));
  const [activeWorkspace, setActiveWorkspace] = useState(1);
  const [activeId, setActiveId] = useState(
    () => Object.values(initialWindows).find((w) => w.isOpen && !w.isMinimized)?.id ?? null,
  );

  /** Highest-z open, non-minimized window on a workspace — used to reassign focus. */
  const topWindowId = useCallback((wins, ws, excludeId) => {
    let best = null;
    let bestZ = -Infinity;
    for (const w of Object.values(wins)) {
      if (!w.isOpen || w.isMinimized || w.id === excludeId || w.workspace !== ws) continue;
      if (w.zIndex > bestZ) { bestZ = w.zIndex; best = w.id; }
    }
    return best;
  }, []);

  const openWindow = useCallback((id) => {
    setMaxZIndex((z) => {
      const nextZ = z + 1;
      setActiveWorkspace((ws) => {
        setWindows((prev) => ({
          ...prev,
          [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: nextZ, workspace: ws },
        }));
        return ws;
      });
      return nextZ;
    });
    setActiveId(id);
  }, []);

  const closeWindow = useCallback((id) => {
    setWindows((prev) => {
      const next = { ...prev, [id]: { ...prev[id], isOpen: false, isMinimized: false } };
      setActiveId((cur) => (cur === id ? topWindowId(next, prev[id].workspace) : cur));
      return next;
    });
  }, [topWindowId]);

  const minimizeWindow = useCallback((id) => {
    setWindows((prev) => {
      const next = { ...prev, [id]: { ...prev[id], isMinimized: true } };
      setActiveId((cur) => (cur === id ? topWindowId(next, prev[id].workspace) : cur));
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

  const toggleFloating = useCallback((id) => {
    setWindows((prev) => ({ ...prev, [id]: { ...prev[id], floating: !prev[id].floating } }));
  }, []);

  const switchWorkspace = useCallback((n) => {
    setActiveWorkspace(n);
    setWindows((prev) => {
      setActiveId(topWindowId(prev, n));
      return prev;
    });
  }, [topWindowId]);

  /** Cycle focus through the open windows on the active workspace (+1 / -1). */
  const cycleFocus = useCallback((dir = 1) => {
    setWindows((prev) => {
      setActiveWorkspace((ws) => {
        const list = Object.values(prev)
          .filter((w) => w.isOpen && !w.isMinimized && w.workspace === ws)
          .sort((a, b) => a.zIndex - b.zIndex);
        if (list.length > 1) {
          setActiveId((cur) => {
            const idx = list.findIndex((w) => w.id === cur);
            const nextIdx = ((idx === -1 ? 0 : idx) + dir + list.length) % list.length;
            return list[nextIdx].id;
          });
        }
        return ws;
      });
      return prev;
    });
  }, []);

  /** Move a window to workspace n and follow it there. */
  const moveToWorkspace = useCallback((id, n) => {
    if (!id) return;
    setWindows((prev) => ({ ...prev, [id]: { ...prev[id], workspace: n } }));
    setActiveWorkspace(n);
    setActiveId(id);
  }, []);

  return useMemo(() => ({
    windows, activeId, activeWorkspace,
    openWindow, closeWindow, minimizeWindow, focusWindow,
    toggleFloating, switchWorkspace, moveToWorkspace, cycleFocus,
  }), [
    windows, activeId, activeWorkspace,
    openWindow, closeWindow, minimizeWindow, focusWindow,
    toggleFloating, switchWorkspace, moveToWorkspace, cycleFocus,
  ]);
}
