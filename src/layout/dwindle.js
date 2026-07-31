/**
 * Dwindle tiling layout (Hyprland's default).
 *
 * Windows fill the workspace as a recursive binary split: each new window
 * splits the remaining space along its longer axis, producing the signature
 * spiral. Gaps are inserted between tiles and around the edges.
 */

/** @typedef {{ x: number, y: number, w: number, h: number }} Rect */

/**
 * Compute tile rectangles for `count` windows inside `area`.
 * @param {Rect} area   available region (already inset for the waybar)
 * @param {number} count number of tiled windows
 * @param {number} [gap] gap between tiles in px
 * @returns {Rect[]} one rect per window, in order
 */
export function dwindle(area, count, gap = 10) {
  if (count <= 0) return [];
  if (count === 1) return [round(area)];

  const rects = [];
  let cur = { ...area };

  for (let i = 0; i < count; i += 1) {
    if (i === count - 1) {
      rects.push(cur);
      break;
    }
    if (cur.w >= cur.h) {
      const half = (cur.w - gap) / 2;
      rects.push({ x: cur.x, y: cur.y, w: half, h: cur.h });
      cur = { x: cur.x + half + gap, y: cur.y, w: cur.w - half - gap, h: cur.h };
    } else {
      const half = (cur.h - gap) / 2;
      rects.push({ x: cur.x, y: cur.y, w: cur.w, h: half });
      cur = { x: cur.x, y: cur.y + half + gap, w: cur.w, h: cur.h - half - gap };
    }
  }

  return rects.map(round);
}

// Round edges (not width/height independently) so adjacent tiles stay flush and
// no tile ever spills 1px past the area edge from separate rounding.
function round(r) {
  const x = Math.round(r.x);
  const y = Math.round(r.y);
  return { x, y, w: Math.round(r.x + r.w) - x, h: Math.round(r.y + r.h) - y };
}

/**
 * Compute the workspace area given the viewport, waybar height and outer gap.
 * @param {number} vw
 * @param {number} vh
 * @param {number} waybar
 * @param {number} outer
 * @returns {Rect}
 */
export function workspaceArea(vw, vh, waybar = 40, outer = 12) {
  return {
    x: outer,
    y: waybar + outer,
    w: vw - outer * 2,
    h: vh - waybar - outer * 2,
  };
}
