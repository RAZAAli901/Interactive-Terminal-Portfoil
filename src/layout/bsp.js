/**
 * Binary-space-partition (BSP) tiling engine — Hyprland's "dwindle" layout.
 *
 * The tree holds one leaf per tiled window. Opening a window splits the focused
 * leaf along its rect's longer axis, which produces the signature dwindle
 * cascade (1 = full, 2 = left/right, 3 = right pane stacks, 4 = bottom-right
 * splits, ...). Closing a window collapses its parent split into the sibling.
 *
 * Every function here is pure: no React, no `window`, no module-level mutable
 * state. Mutations return a NEW tree (children are structurally shared) so the
 * caller can hold the tree in React state and StrictMode's double-invoke stays
 * harmless.
 */

/** @typedef {{ x: number, y: number, w: number, h: number }} Rect */
/** @typedef {{ id: string }} LeafNode */
/** @typedef {{ sid: number, dir: 'row'|'col', ratio: number, children: [Node, Node] }} SplitNode */
/** @typedef {LeafNode | SplitNode} Node */
/** @typedef {{ sid: number, dir: 'row'|'col', x: number, y: number, size: number, len: number, prect: Rect }} Divider */

/** Smallest share a split may give its first child. */
export const RATIO_MIN = 0.12;
/** Largest share a split may give its first child. */
export const RATIO_MAX = 0.88;
/** Gap between adjacent panes, in px. */
export const GAP = 8;
/** Outer margin between the tiling area and the viewport edges, in px. */
export const MARGIN = 12;

/** Leaves are the only nodes carrying an `id`. */
const isLeaf = (node) => !!node && node.id != null;

const clampRatio = (r) => Math.max(RATIO_MIN, Math.min(RATIO_MAX, r));

/**
 * @param {string} id
 * @returns {LeafNode}
 */
export function leaf(id) {
  return { id };
}

/**
 * Left-most window id in the tree (the dwindle "first" pane).
 * @param {Node|null} node
 * @returns {string|null}
 */
export function firstLeaf(node) {
  if (!node) return null;
  if (isLeaf(node)) return node.id;
  return firstLeaf(node.children[0]);
}

/**
 * @param {Node|null} node
 * @param {string} id
 * @returns {boolean}
 */
export function hasLeaf(node, id) {
  if (!node) return false;
  if (isLeaf(node)) return node.id === id;
  return hasLeaf(node.children[0], id) || hasLeaf(node.children[1], id);
}

/**
 * @param {Node|null} node
 * @returns {number} number of tiled windows in the tree
 */
export function countLeaves(node) {
  if (!node) return 0;
  if (isLeaf(node)) return 1;
  return countLeaves(node.children[0]) + countLeaves(node.children[1]);
}

/**
 * Every window id, in left-to-right (in-order) tree order.
 * @param {Node|null} node
 * @returns {string[]}
 */
export function allLeaves(node) {
  if (!node) return [];
  if (isLeaf(node)) return [node.id];
  return [...allLeaves(node.children[0]), ...allLeaves(node.children[1])];
}

/**
 * Split `rect` into the two child rects of a split node, gap included.
 * @param {SplitNode} node
 * @param {Rect} rect
 * @param {number} [gap]
 * @returns {[Rect, Rect]}
 */
export function splitArea(node, rect, gap = GAP) {
  if (node.dir === 'row') {
    const w1 = Math.round((rect.w - gap) * node.ratio);
    return [
      { x: rect.x, y: rect.y, w: w1, h: rect.h },
      { x: rect.x + w1 + gap, y: rect.y, w: rect.w - w1 - gap, h: rect.h },
    ];
  }
  const h1 = Math.round((rect.h - gap) * node.ratio);
  return [
    { x: rect.x, y: rect.y, w: rect.w, h: h1 },
    { x: rect.x, y: rect.y + h1 + gap, w: rect.w, h: rect.h - h1 - gap },
  ];
}

// Recursion for insertLeaf. `alloc` is call-local, so sid allocation stays pure
// from the caller's point of view.
function insertInto(node, targetId, newId, area, gap, alloc) {
  if (!node) return leaf(newId);
  if (isLeaf(node)) {
    if (node.id !== targetId) return node;
    // Split along the longer axis of the target's own rect.
    const dir = area.w >= area.h ? 'row' : 'col';
    const sid = alloc.sid;
    alloc.sid += 1;
    return { sid, dir, ratio: 0.5, children: [leaf(targetId), leaf(newId)] };
  }
  const [a1, a2] = splitArea(node, area, gap);
  return {
    ...node,
    children: [
      insertInto(node.children[0], targetId, newId, a1, gap, alloc),
      insertInto(node.children[1], targetId, newId, a2, gap, alloc),
    ],
  };
}

/**
 * Insert `newId` by splitting the leaf `targetId`. `area` is the whole tiling
 * area (child rects are derived on the way down so the split direction is
 * picked from the target's real rect).
 *
 * Returns the next free sid alongside the tree so the caller keeps ownership of
 * the counter — a module-level counter would desync under React StrictMode.
 *
 * @param {Node|null} node
 * @param {string|null} targetId
 * @param {string} newId
 * @param {Rect} area
 * @param {number} [nextSid] first sid available for a new split
 * @param {number} [gap]
 * @returns {{ tree: Node, nextSid: number }}
 */
export function insertLeaf(node, targetId, newId, area, nextSid = 1, gap = GAP) {
  const alloc = { sid: nextSid };
  const tree = insertInto(node, targetId, newId, area, gap, alloc);
  return { tree, nextSid: alloc.sid };
}

/**
 * Drop a leaf; its parent split collapses into the surviving sibling, which
 * then reclaims the parent's full rect.
 * @param {Node|null} node
 * @param {string} id
 * @returns {Node|null}
 */
export function removeLeaf(node, id) {
  if (!node) return null;
  if (isLeaf(node)) return node.id === id ? null : node;
  const c0 = removeLeaf(node.children[0], id);
  const c1 = removeLeaf(node.children[1], id);
  if (!c0) return c1;
  if (!c1) return c0;
  if (c0 === node.children[0] && c1 === node.children[1]) return node;
  return { ...node, children: [c0, c1] };
}

/**
 * Set one split's ratio, clamped to [RATIO_MIN, RATIO_MAX]. Other splits are
 * returned untouched (and structurally shared).
 * @param {Node|null} node
 * @param {number} sid
 * @param {number} ratio
 * @returns {Node|null}
 */
export function setRatio(node, sid, ratio) {
  if (!node || isLeaf(node)) return node;
  if (node.sid === sid) return { ...node, ratio: clampRatio(ratio) };
  const c0 = setRatio(node.children[0], sid, ratio);
  const c1 = setRatio(node.children[1], sid, ratio);
  if (c0 === node.children[0] && c1 === node.children[1]) return node;
  return { ...node, children: [c0, c1] };
}

/**
 * Trade two window ids at their leaf positions — geometry stays put, contents
 * swap places.
 * @param {Node|null} node
 * @param {string} a
 * @param {string} b
 * @returns {Node|null}
 */
export function swapLeaves(node, a, b) {
  if (!node) return node;
  if (isLeaf(node)) {
    if (node.id === a) return leaf(b);
    if (node.id === b) return leaf(a);
    return node;
  }
  return {
    ...node,
    children: [swapLeaves(node.children[0], a, b), swapLeaves(node.children[1], a, b)],
  };
}

function walk(node, rect, gap, rects, dividers) {
  if (!node) return;
  if (isLeaf(node)) {
    rects[node.id] = rect;
    return;
  }
  const [a1, a2] = splitArea(node, rect, gap);
  if (node.dir === 'row') {
    // vertical divider sitting in the gap, spanning the parent's height
    dividers.push({ sid: node.sid, dir: 'row', x: a1.x + a1.w, y: rect.y, size: gap, len: rect.h, prect: rect });
  } else {
    // horizontal divider, spanning the parent's width
    dividers.push({ sid: node.sid, dir: 'col', x: rect.x, y: a1.y + a1.h, size: gap, len: rect.w, prect: rect });
  }
  walk(node.children[0], a1, gap, rects, dividers);
  walk(node.children[1], a2, gap, rects, dividers);
}

/**
 * Resolve the tree into per-window rects plus one divider record per split.
 * @param {Node|null} node
 * @param {Rect} rect the tiling area
 * @param {number} [gap]
 * @returns {{ rects: Record<string, Rect>, dividers: Divider[] }}
 */
export function computeLayout(node, rect, gap = GAP) {
  const rects = {};
  const dividers = [];
  walk(node, rect, gap, rects, dividers);
  return { rects, dividers };
}

/**
 * Id of the largest pane — where a re-tiled window gets inserted.
 * @param {Record<string, Rect>} rects
 * @returns {string|null}
 */
export function firstLeafInBiggest(rects) {
  let best = null;
  let area = -1;
  for (const id in rects) {
    const r = rects[id];
    const a = r.w * r.h;
    if (a > area) {
      area = a;
      best = id;
    }
  }
  return best;
}

/**
 * Tiling area for a viewport: below the status bar, inset by `margin`.
 * @param {number} innerW
 * @param {number} innerH
 * @param {number} [barH]
 * @param {number} [margin]
 * @returns {Rect}
 */
export function tilingArea(innerW, innerH, barH = 40, margin = MARGIN) {
  return {
    x: margin,
    y: barH + margin,
    w: innerW - 2 * margin,
    h: innerH - barH - 2 * margin,
  };
}
