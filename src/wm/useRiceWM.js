import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { GAP, MARGIN, computeLayout, tilingArea } from '../layout/bsp';
import { WORKSPACES, initialState, wmReducer } from './wmReducer';

export const WAYBAR_H = 40;
export { WORKSPACES };

/**
 * Hyprland window manager: BSP tiling per workspace, a floating mode, and the
 * four live pointer gestures (move, resize, title-bar swap, divider drag).
 *
 * Gesture state lives in a ref rather than React state — the ref is the source
 * of truth for the in-flight gesture, and each mousemove dispatches only the
 * committed value. That keeps dragging 1:1 with the cursor and lets the frames
 * drop their layout transition while a gesture is active.
 *
 * @param {Record<string, {title: string, color: string, w: number, h: number}>} appDefs
 */
export function useRiceWM(appDefs) {
  const [state, dispatch] = useReducer(wmReducer, undefined, initialState);
  const [overview, setOverview] = useState(false);
  const [drag, setDrag] = useState({ id: null, target: null, cursor: null });
  const [viewport, setViewport] = useState(() => ({
    w: typeof window === 'undefined' ? 1280 : window.innerWidth,
    h: typeof window === 'undefined' ? 800 : window.innerHeight,
  }));
  // Bumped when a gesture starts/ends so `animated` re-evaluates.
  const [, bumpFrame] = useState(0);
  const actionRef = useRef(null);

  const area = useMemo(
    () => tilingArea(viewport.w, viewport.h, WAYBAR_H, MARGIN),
    [viewport],
  );

  const tree = state.trees[state.activeWorkspace] || null;

  const { rects, dividers } = useMemo(
    () => computeLayout(tree, area, GAP),
    [tree, area],
  );

  // ── viewport ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Mirrors so the once-registered global listeners always read fresh values.
  const live = useRef({ rects, drag, ws: state.activeWorkspace });
  live.current = { rects, drag, ws: state.activeWorkspace };

  // ── actions ──────────────────────────────────────────────────────────────
  const openApp = useCallback(
    (app) => dispatch({ type: 'open', app, def: appDefs[app], area }),
    [appDefs, area],
  );
  const closeWindow = useCallback((id) => dispatch({ type: 'close', id }), []);
  const minimizeWindow = useCallback((id) => dispatch({ type: 'minimize', id }), []);
  const focusWindow = useCallback((id) => dispatch({ type: 'focus', id, area }), [area]);
  const switchWorkspace = useCallback((n) => dispatch({ type: 'workspace', n }), []);
  const moveToWorkspace = useCallback(
    (id, n) => dispatch({ type: 'moveToWorkspace', id, n, area }),
    [area],
  );
  const toggleLayout = useCallback(
    () => dispatch({ type: 'toggleLayout', rects, area }),
    [rects, area],
  );

  const openIds = useMemo(
    () => Object.values(state.windows)
      .filter((w) => !w.min && w.ws === state.activeWorkspace)
      .sort((a, b) => a.z - b.z)
      .map((w) => w.id),
    [state.windows, state.activeWorkspace],
  );

  const cycleFocus = useCallback((dir = 1) => {
    if (openIds.length < 2) return;
    const idx = openIds.indexOf(state.focusedId);
    focusWindow(openIds[((idx === -1 ? 0 : idx) + dir + openIds.length) % openIds.length]);
  }, [openIds, state.focusedId, focusWindow]);

  // ── gesture starts ───────────────────────────────────────────────────────
  const startMove = useCallback((id, e) => {
    const win = state.windows[id];
    if (!win) return;
    actionRef.current = { type: 'move', id, dx: e.clientX - win.fx, dy: e.clientY - win.fy };
    focusWindow(id);
    bumpFrame((n) => n + 1);
  }, [state.windows, focusWindow]);

  const startResize = useCallback((id, e) => {
    const win = state.windows[id];
    if (!win) return;
    actionRef.current = { type: 'resize', id, x0: e.clientX, y0: e.clientY, w0: win.fw, h0: win.fh };
    focusWindow(id);
    bumpFrame((n) => n + 1);
  }, [state.windows, focusWindow]);

  const startTileDrag = useCallback((id, e) => {
    actionRef.current = { type: 'tiledrag', id };
    setDrag({ id, target: null, cursor: { x: e.clientX, y: e.clientY } });
    focusWindow(id);
    bumpFrame((n) => n + 1);
  }, [focusWindow]);

  const startDivider = useCallback((divider, e) => {
    e.preventDefault();
    actionRef.current = { type: 'divider', sid: divider.sid, dir: divider.dir, prect: divider.prect };
    bumpFrame((n) => n + 1);
  }, []);

  // ── global gesture listeners (registered once) ───────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      const a = actionRef.current;
      if (!a) return;

      if (a.type === 'move') {
        dispatch({
          type: 'moveFloat',
          id: a.id,
          x: Math.max(0, Math.min(window.innerWidth - 120, e.clientX - a.dx)),
          y: Math.max(WAYBAR_H, Math.min(window.innerHeight - 60, e.clientY - a.dy)),
        });
      } else if (a.type === 'resize') {
        dispatch({
          type: 'resizeFloat',
          id: a.id,
          w: Math.max(300, a.w0 + (e.clientX - a.x0)),
          h: Math.max(200, a.h0 + (e.clientY - a.y0)),
        });
      } else if (a.type === 'tiledrag') {
        // Whichever tiled pane is under the cursor becomes the drop target.
        const r = live.current.rects;
        let target = null;
        for (const wid of Object.keys(r)) {
          if (wid === a.id) continue;
          const q = r[wid];
          if (e.clientX >= q.x && e.clientX <= q.x + q.w && e.clientY >= q.y && e.clientY <= q.y + q.h) {
            target = wid;
            break;
          }
        }
        setDrag({ id: a.id, target, cursor: { x: e.clientX, y: e.clientY } });
      } else if (a.type === 'divider') {
        const ratio = a.dir === 'row'
          ? (e.clientX - a.prect.x) / a.prect.w
          : (e.clientY - a.prect.y) / a.prect.h;
        dispatch({ type: 'setRatio', sid: a.sid, ratio, ws: live.current.ws });
      }
    };

    const onUp = () => {
      const a = actionRef.current;
      if (!a) return;
      if (a.type === 'tiledrag') {
        const { id, target } = live.current.drag;
        if (target && target !== id) {
          dispatch({ type: 'swap', a: id, b: target, ws: live.current.ws });
        }
        setDrag({ id: null, target: null, cursor: null });
      }
      actionRef.current = null;
      bumpFrame((n) => n + 1);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  const tiling = state.layout === 'dwindle';

  /** Geometry per visible window: tiled rect in dwindle, float rect otherwise. */
  const geometry = useMemo(() => {
    const out = {};
    for (const id of openIds) {
      const w = state.windows[id];
      out[id] = (tiling && rects[id]) ? rects[id] : { x: w.fx, y: w.fy, w: w.fw, h: w.fh };
    }
    return out;
  }, [openIds, state.windows, tiling, rects]);

  const occupied = useMemo(
    () => new Set(Object.values(state.windows).filter((w) => !w.min).map((w) => w.ws)),
    [state.windows],
  );

  /** Every window on the active workspace, minimized included — the dock list. */
  const dockWindows = useMemo(
    () => Object.values(state.windows)
      .filter((w) => w.ws === state.activeWorkspace)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((w) => ({
        id: w.id,
        title: appDefs[w.app]?.title || w.app,
        color: appDefs[w.app]?.color,
        minimized: w.min,
        focused: w.id === state.focusedId,
      })),
    [state.windows, state.activeWorkspace, state.focusedId, appDefs],
  );

  return {
    windows: state.windows,
    layout: state.layout,
    activeWorkspace: state.activeWorkspace,
    focusedId: state.focusedId,
    tiling,
    tree, rects, dividers, geometry, openIds, occupied, dockWindows,
    area, viewport,
    overview, setOverview,
    drag,
    // False mid-gesture so window frames drop their transition and track 1:1.
    animated: !actionRef.current,
    openApp, closeWindow, minimizeWindow, focusWindow,
    toggleLayout, switchWorkspace, moveToWorkspace, cycleFocus,
    startMove, startResize, startTileDrag, startDivider,
  };
}
