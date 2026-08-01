import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { GAP, MARGIN, computeLayout, tilingArea } from '../layout/bsp';
import { WORKSPACES, initialState, wmReducer } from './wmReducer';

export const WAYBAR_H = 40;
export { WORKSPACES };

/** Find a split node by its stable id. */
function findSplit(node, sid) {
  if (!node || node.id != null) return null;
  if (node.sid === sid) return node;
  return findSplit(node.children[0], sid) || findSplit(node.children[1], sid);
}

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
  const treeRef = useRef(tree);
  treeRef.current = tree;

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

  /**
   * Signature of only the fields the bar and dock actually care about.
   *
   * Dragging a floating window rewrites `state.windows` on every pointer move.
   * Keying the derived views on this string instead of the object means the top
   * bar and dock re-render when a window really changes workspace/minimised/
   * focus state — not once per mouse event.
   */
  const shellSig = useMemo(
    () => Object.values(state.windows)
      .map((w) => `${w.id}:${w.ws}:${w.min ? 1 : 0}:${w.app}`)
      .sort()
      .join('|'),
    [state.windows],
  );

  const openIds = useMemo(
    () => Object.values(state.windows)
      .filter((w) => !w.min && w.ws === state.activeWorkspace)
      .sort((a, b) => a.z - b.z)
      .map((w) => w.id),
    [state.windows, state.activeWorkspace],
  );

  /**
   * Every non-minimized window across all workspaces, in stable id order.
   *
   * The desktop mounts all of these and hides the ones that are not on the
   * active workspace, so switching workspaces preserves each app's state —
   * terminal scrollback, scroll position, half-typed input — instead of
   * unmounting and rebuilding it.
   */
  const mountedIds = useMemo(
    () => Object.values(state.windows)
      .filter((w) => !w.min)
      .map((w) => w.id)
      .sort(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shellSig],
  );

  const cycleFocus = useCallback((dir = 1) => {
    if (openIds.length < 2) return;
    const idx = openIds.indexOf(state.focusedId);
    focusWindow(openIds[((idx === -1 ? 0 : idx) + dir + openIds.length) % openIds.length]);
  }, [openIds, state.focusedId, focusWindow]);

  /**
   * Toggle the overview. Opening is a no-op with nothing to show, and it closes
   * itself if the last window is closed while it is open.
   */
  const toggleOverview = useCallback((next) => {
    setOverview((cur) => {
      const want = typeof next === 'boolean' ? next : !cur;
      return want && openIds.length === 0 ? false : want;
    });
  }, [openIds.length]);

  useEffect(() => {
    if (overview && openIds.length === 0) setOverview(false);
  }, [overview, openIds.length]);

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
    // Remember which workspace the drag began on: a mid-gesture workspace
    // switch must not retarget the swap at a different tree.
    actionRef.current = { type: 'tiledrag', id, ws: live.current.ws };
    setDrag({ id, target: null, cursor: { x: e.clientX, y: e.clientY } });
    focusWindow(id);
    bumpFrame((n) => n + 1);
  }, [focusWindow]);

  const startDivider = useCallback((divider, e) => {
    e.preventDefault();
    actionRef.current = { type: 'divider', sid: divider.sid, dir: divider.dir, prect: divider.prect };
    bumpFrame((n) => n + 1);
  }, []);

  /** Keyboard resize: shift a split's ratio by `delta` (arrow keys on a divider). */
  const nudgeDivider = useCallback((divider, delta) => {
    const node = findSplit(treeRef.current, divider.sid);
    if (!node) return;
    dispatch({ type: 'setRatio', sid: divider.sid, ratio: node.ratio + delta, ws: live.current.ws });
  }, []);

  // ── global gesture listeners (registered once) ───────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      const a = actionRef.current;
      if (!a) return;
      // The button can be released outside the document (over browser chrome, or
      // in another window), in which case no mouseup ever reaches us. Any move
      // with no button held means the gesture is over — end it here.
      if (e.buttons === 0) { endGesture(); return; }

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

    const endGesture = () => {
      const a = actionRef.current;
      if (!a) return;
      if (a.type === 'tiledrag') {
        const { id, target } = live.current.drag;
        if (target && target !== id) {
          dispatch({ type: 'swap', a: id, b: target, ws: a.ws ?? live.current.ws });
        }
        setDrag({ id: null, target: null, cursor: null });
      }
      actionRef.current = null;
      bumpFrame((n) => n + 1);
    };

    // A gesture also ends if the pointer leaves for another window entirely.
    const onBlur = () => endGesture();

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', endGesture);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', endGesture);
      window.removeEventListener('blur', onBlur);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shellSig],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shellSig, state.activeWorkspace, state.focusedId, appDefs],
  );

  return {
    windows: state.windows,
    layout: state.layout,
    activeWorkspace: state.activeWorkspace,
    focusedId: state.focusedId,
    tiling,
    tree, rects, dividers, geometry, openIds, mountedIds, occupied, dockWindows,
    area, viewport,
    overview, setOverview: toggleOverview,
    drag,
    // False mid-gesture so window frames drop their transition and track 1:1.
    animated: !actionRef.current,
    openApp, closeWindow, minimizeWindow, focusWindow,
    toggleLayout, switchWorkspace, moveToWorkspace, cycleFocus,
    startMove, startResize, startTileDrag, startDivider, nudgeDivider,
  };
}
