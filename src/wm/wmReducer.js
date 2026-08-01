import {
  GAP, RATIO_MAX, RATIO_MIN,
  computeLayout, firstLeaf, firstLeafInBiggest, hasLeaf,
  insertLeaf, leaf, removeLeaf, setRatio, swapLeaves,
} from '../layout/bsp';

export const WORKSPACES = [1, 2, 3, 4, 5];

/**
 * Window-manager reducer.
 *
 * All window state lives here as one atomic value so a single action can move a
 * window, re-tile its workspace and re-focus it without any risk of the partial
 * updates that nested setState calls produce (React StrictMode double-invokes
 * updaters, which would otherwise insert a window into the tree twice).
 *
 * Every workspace owns its own BSP tree, mirroring how a real compositor keeps
 * a separate layout per workspace. Minimized windows leave the tree entirely and
 * exist only in the dock.
 */
export function initialState() {
  return {
    windows: {},                                                   // id -> window record
    trees: Object.fromEntries(WORKSPACES.map((n) => [n, null])),   // ws -> BSP tree
    layout: 'dwindle',
    activeWorkspace: 1,
    focusedId: null,
    z: 100,
    sid: 1,
    termCount: 1,
  };
}

/** Insert `id` into `wsTree`, splitting the focused pane (or the first leaf). */
function insertInto(wsTree, id, focusId, area, sid) {
  if (!wsTree) return { tree: leaf(id), sid };
  const target = (focusId && hasLeaf(wsTree, focusId)) ? focusId : firstLeaf(wsTree);
  if (!target) return { tree: leaf(id), sid };
  const { rects } = computeLayout(wsTree, area, GAP);
  const res = insertLeaf(wsTree, target, id, rects[target] || area, sid, GAP);
  return { tree: res.tree, sid: res.nextSid };
}

export function wmReducer(state, action) {
  switch (action.type) {
    // ── open / close ─────────────────────────────────────────────────────
    case 'open': {
      const { app, def, area } = action;
      if (!def) return state;
      // Terminals are multi-instance (each Ctrl+Q spawns term1, term2, …);
      // every other app is a singleton that gets raised instead of duplicated.
      const isTerm = app === 'terminal';
      const existingId = Object.keys(state.windows).find((k) => state.windows[k].app === app);
      const id = isTerm ? `term${state.termCount}` : (existingId || app);
      const z = state.z + 1;
      const ws = state.activeWorkspace;
      const prev = state.windows[id];
      const count = Object.keys(state.windows).length;
      const win = prev
        ? { ...prev, min: false, z, ws }
        : {
          id, app, min: false, z, ws,
          fx: 80 + (count % 6) * 30,
          fy: 70 + (count % 6) * 28,
          fw: def.w, fh: def.h,
        };

      let trees = state.trees;
      let sid = state.sid;
      if (state.layout === 'dwindle' && !hasLeaf(trees[ws], id)) {
        const res = insertInto(trees[ws], id, state.focusedId, area, sid);
        trees = { ...trees, [ws]: res.tree };
        sid = res.sid;
      }

      return {
        ...state,
        windows: { ...state.windows, [id]: win },
        trees, sid, z,
        focusedId: id,
        termCount: state.termCount + (isTerm ? 1 : 0),
      };
    }

    case 'close': {
      const win = state.windows[action.id];
      if (!win) return state;
      const windows = { ...state.windows };
      delete windows[action.id];
      const trees = { ...state.trees, [win.ws]: removeLeaf(state.trees[win.ws], action.id) };
      return {
        ...state,
        windows,
        trees,
        focusedId: state.focusedId === action.id ? firstLeaf(trees[win.ws]) : state.focusedId,
      };
    }

    case 'minimize': {
      const win = state.windows[action.id];
      if (!win || win.min) return state;
      const trees = { ...state.trees, [win.ws]: removeLeaf(state.trees[win.ws], action.id) };
      return {
        ...state,
        windows: { ...state.windows, [action.id]: { ...win, min: true } },
        trees,
        focusedId: state.focusedId === action.id ? firstLeaf(trees[win.ws]) : state.focusedId,
      };
    }

    // ── focus ────────────────────────────────────────────────────────────
    case 'focus': {
      const win = state.windows[action.id];
      if (!win) return state;
      const z = state.z + 1;
      let trees = state.trees;
      let sid = state.sid;
      // Restoring from the dock (or focusing an untiled window) re-inserts it.
      if (state.layout === 'dwindle' && !hasLeaf(trees[win.ws], action.id)) {
        const res = insertInto(trees[win.ws], action.id, state.focusedId, action.area, sid);
        trees = { ...trees, [win.ws]: res.tree };
        sid = res.sid;
      }
      return {
        ...state,
        windows: { ...state.windows, [action.id]: { ...win, min: false, z } },
        trees, sid, z,
        activeWorkspace: win.ws,
        focusedId: action.id,
      };
    }

    // ── workspaces ───────────────────────────────────────────────────────
    case 'workspace':
      if (action.n === state.activeWorkspace) return state;
      return {
        ...state,
        activeWorkspace: action.n,
        focusedId: firstLeaf(state.trees[action.n]),
      };

    case 'moveToWorkspace': {
      const win = state.windows[action.id];
      if (!win || win.ws === action.n) return state;
      const res = insertInto(state.trees[action.n], action.id, null, action.area, state.sid);
      return {
        ...state,
        windows: { ...state.windows, [action.id]: { ...win, ws: action.n, min: false } },
        trees: {
          ...state.trees,
          [win.ws]: removeLeaf(state.trees[win.ws], action.id),
          [action.n]: res.tree,
        },
        sid: res.sid,
        activeWorkspace: action.n,
        focusedId: action.id,
      };
    }

    // ── layout mode ──────────────────────────────────────────────────────
    case 'toggleLayout': {
      if (state.layout === 'dwindle') {
        // dwindle -> float: seed each float rect from its live tiled rect so the
        // windows visually stay put at the moment they detach.
        const windows = { ...state.windows };
        for (const [id, r] of Object.entries(action.rects || {})) {
          if (windows[id]) windows[id] = { ...windows[id], fx: r.x, fy: r.y, fw: r.w, fh: r.h };
        }
        return { ...state, layout: 'float', windows };
      }
      // float -> dwindle: rebuild every workspace tree in z-order, each window
      // splitting the biggest pane available at that point.
      const trees = Object.fromEntries(WORKSPACES.map((n) => [n, null]));
      let sid = state.sid;
      const ordered = Object.values(state.windows)
        .filter((w) => !w.min)
        .sort((a, b) => a.z - b.z);
      for (const w of ordered) {
        const wsTree = trees[w.ws];
        if (!wsTree) { trees[w.ws] = leaf(w.id); continue; }
        const { rects } = computeLayout(wsTree, action.area, GAP);
        const target = firstLeafInBiggest(rects);
        const res = insertLeaf(wsTree, target, w.id, rects[target] || action.area, sid, GAP);
        trees[w.ws] = res.tree;
        sid = res.nextSid;
      }
      return { ...state, layout: 'dwindle', trees, sid };
    }

    // ── live gestures ────────────────────────────────────────────────────
    case 'moveFloat': {
      const win = state.windows[action.id];
      if (!win) return state;
      return { ...state, windows: { ...state.windows, [action.id]: { ...win, fx: action.x, fy: action.y } } };
    }

    case 'resizeFloat': {
      const win = state.windows[action.id];
      if (!win) return state;
      return { ...state, windows: { ...state.windows, [action.id]: { ...win, fw: action.w, fh: action.h } } };
    }

    case 'setRatio': {
      const ws = action.ws ?? state.activeWorkspace;
      const ratio = Math.max(RATIO_MIN, Math.min(RATIO_MAX, action.ratio));
      return { ...state, trees: { ...state.trees, [ws]: setRatio(state.trees[ws], action.sid, ratio) } };
    }

    case 'swap': {
      const ws = action.ws ?? state.activeWorkspace;
      if (!action.a || !action.b || action.a === action.b) return state;
      const tree = state.trees[ws];
      // Both ids must live in THIS tree. Swapping when only one is present would
      // rename the other's leaf, losing a window and leaving a phantom id behind
      // — reachable by switching workspace mid-drag.
      if (!hasLeaf(tree, action.a) || !hasLeaf(tree, action.b)) return state;
      return { ...state, trees: { ...state.trees, [ws]: swapLeaves(tree, action.a, action.b) } };
    }

    default:
      return state;
  }
}
