import { describe, it, expect } from 'vitest';
import { overviewLayout, OVERVIEW_DEFAULTS } from '../shell/overviewGrid';

const VP = { w: 1440, h: 900 };
const { gap, mx, topOff, botOff, shrink } = OVERVIEW_DEFAULTS;
const EPS = 1e-9;

/** n uniform windows, ids w0..w(n-1). */
const uniform = (n, w = 400, h = 300) =>
  Array.from({ length: n }, (_, i) => ({ id: `w${i}`, w, h }));

/** Distinct values of a numeric field, tolerant of float noise. */
const distinct = (cells, key) => [...new Set(cells.map((c) => c[key].toFixed(6)))];

describe('overviewLayout', () => {
  it('returns nothing for an empty list', () => {
    expect(overviewLayout([], VP)).toEqual([]);
  });

  it('uses ceil(sqrt(n)) columns for n = 1..10', () => {
    for (let n = 1; n <= 10; n += 1) {
      const cells = overviewLayout(uniform(n), VP);
      const cols = Math.ceil(Math.sqrt(n));
      const rows = Math.ceil(n / cols);
      expect(cells).toHaveLength(n);
      // uniform windows -> one distinct left per column, one distinct top per row
      expect(distinct(cells, 'left')).toHaveLength(Math.min(cols, n));
      expect(distinct(cells, 'top')).toHaveLength(rows);
    }
  });

  it('keeps every window inside the viewport bounds', () => {
    const sizes = [
      { w: 580, h: 400 }, { w: 740, h: 500 }, { w: 760, h: 540 },
      { w: 380, h: 260 }, { w: 620, h: 420 }, { w: 540, h: 470 },
      { w: 600, h: 480 },
    ];
    for (let n = 1; n <= 7; n += 1) {
      const items = sizes.slice(0, n).map((s, i) => ({ id: `w${i}`, ...s }));
      for (const c of overviewLayout(items, VP)) {
        expect(c.left).toBeGreaterThanOrEqual(mx - EPS);
        expect(c.top).toBeGreaterThanOrEqual(topOff - EPS);
        expect(c.left + c.w * c.scale).toBeLessThanOrEqual(VP.w - mx + EPS);
        expect(c.top + c.h * c.scale).toBeLessThanOrEqual(VP.h - botOff + EPS);
      }
    }
  });

  it('never scales a window above the shrink factor', () => {
    // huge viewport: every window would fit at 1:1, so shrink is the ceiling
    for (const c of overviewLayout(uniform(6), { w: 6000, h: 4000 })) {
      expect(c.scale).toBeLessThanOrEqual(shrink + EPS);
      expect(c.scale).toBeCloseTo(shrink, 10);
    }
    for (const c of overviewLayout(uniform(9), VP, { shrink: 0.8 })) {
      expect(c.scale).toBeLessThanOrEqual(0.8 + EPS);
    }
  });

  it('emits finite, non-negative numbers for degenerate input', () => {
    const cases = [
      overviewLayout(uniform(1), VP),
      overviewLayout(uniform(1), { w: 0, h: 0 }),
      overviewLayout(uniform(4), { w: 100, h: 80 }),
      overviewLayout([{ id: 'a', w: 0, h: 0 }], VP),
      overviewLayout([{ id: 'a' }], undefined),
    ];
    for (const cells of cases) {
      for (const c of cells) {
        expect(Number.isFinite(c.left)).toBe(true);
        expect(Number.isFinite(c.top)).toBe(true);
        expect(Number.isFinite(c.scale)).toBe(true);
        expect(c.scale).toBeGreaterThanOrEqual(0);
        expect(c.w).toBeGreaterThan(0);
        expect(c.h).toBeGreaterThan(0);
      }
    }
  });

  it('centers each window inside its cell', () => {
    const cellW = VP.w - 2 * mx;
    const cellH = VP.h - topOff - botOff;
    const [only] = overviewLayout([{ id: 'a', w: 580, h: 400 }], VP);
    expect(only.left + (only.w * only.scale) / 2).toBeCloseTo(mx + cellW / 2, 6);
    expect(only.top + (only.h * only.scale) / 2).toBeCloseTo(topOff + cellH / 2, 6);

    // second cell of a 2-up grid (cols = 2, rows = 1)
    const twoW = (VP.w - 2 * mx - gap) / 2;
    const [, second] = overviewLayout(uniform(2), VP);
    expect(second.left + (second.w * second.scale) / 2).toBeCloseTo(mx + twoW + gap + twoW / 2, 6);
    expect(second.top + (second.h * second.scale) / 2).toBeCloseTo(topOff + cellH / 2, 6);
  });

  it('scales windows of different sizes differently', () => {
    const [small, big] = overviewLayout(
      [{ id: 'small', w: 400, h: 300 }, { id: 'big', w: 900, h: 700 }],
      { w: 1200, h: 800 },
    );
    expect(small.scale).not.toBeCloseTo(big.scale, 3);
    expect(big.scale).toBeLessThan(small.scale);
    // the big one is width-constrained by its cell
    const cellW = (1200 - 2 * mx - gap) / 2;
    expect(big.scale).toBeCloseTo((cellW / 900) * shrink, 10);
  });

  it('honours custom gaps and margins', () => {
    const [a, b] = overviewLayout(uniform(2), VP, { gap: 0, mx: 0, topOff: 0, botOff: 0 });
    const half = VP.w / 2;
    expect(a.left + (a.w * a.scale) / 2).toBeCloseTo(half / 2, 6);
    expect(b.left + (b.w * b.scale) / 2).toBeCloseTo(half + half / 2, 6);
  });
});
