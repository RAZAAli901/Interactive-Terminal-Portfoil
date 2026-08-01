/**
 * hyprexpo-style overview (expo) grid.
 *
 * Every open window keeps its real pixel size and is scaled down into a cell of
 * a square-ish grid, so the thumbnails stay proportional to the live layout.
 * Pure function: no React, no `window` — the caller passes the viewport in.
 */

/** @typedef {{ id: string, w: number, h: number }} OverviewItem */
/** @typedef {{ id: string, left: number, top: number, scale: number, w: number, h: number }} OverviewCell */

/** Margins/gaps of the expo grid, in px (`shrink` leaves air around each tile). */
export const OVERVIEW_DEFAULTS = { gap: 26, mx: 70, topOff: 92, botOff: 40, shrink: 0.94 };

const num = (v, fallback) => (Number.isFinite(v) ? v : fallback);

/**
 * Lay out overview thumbnails.
 * @param {OverviewItem[]} items    windows in render order
 * @param {{ w: number, h: number }} viewport
 * @param {Partial<typeof OVERVIEW_DEFAULTS>} [opts]
 * @returns {OverviewCell[]} one entry per item, in the same order
 */
export function overviewLayout(items, viewport, opts) {
  const list = Array.isArray(items) ? items : [];
  const n = list.length;
  if (n === 0) return [];

  const o = opts || {};
  const gap = num(o.gap, OVERVIEW_DEFAULTS.gap);
  const mx = num(o.mx, OVERVIEW_DEFAULTS.mx);
  const topOff = num(o.topOff, OVERVIEW_DEFAULTS.topOff);
  const botOff = num(o.botOff, OVERVIEW_DEFAULTS.botOff);
  const shrink = Math.max(0, num(o.shrink, OVERVIEW_DEFAULTS.shrink));

  const vw = Math.max(0, num(viewport && viewport.w, 0));
  const vh = Math.max(0, num(viewport && viewport.h, 0));

  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  // A viewport smaller than the margins would give negative cells (and inverted
  // thumbnails), so clamp at 0 — the tiles just collapse to scale 0 instead.
  const cellW = Math.max(0, (vw - 2 * mx - (cols - 1) * gap) / cols);
  const cellH = Math.max(0, (vh - topOff - botOff - (rows - 1) * gap) / rows);

  return list.map((it, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const cellX = mx + c * (cellW + gap);
    const cellY = topOff + r * (cellH + gap);
    // Guard zero/NaN window sizes so the ratios below can never divide by 0.
    const w = Math.max(1, num(it && it.w, 1));
    const h = Math.max(1, num(it && it.h, 1));
    const scale = Math.max(0, Math.min(cellW / w, cellH / h, 1) * shrink);
    return {
      id: it && it.id,
      left: cellX + (cellW - w * scale) / 2,
      top: cellY + (cellH - h * scale) / 2,
      scale,
      w,
      h,
    };
  });
}
