import { describe, it, expect } from 'vitest';
import { dwindle, workspaceArea } from '../layout/dwindle';

const AREA = { x: 0, y: 0, w: 1000, h: 600 };

describe('dwindle', () => {
  it('returns nothing for zero windows', () => {
    expect(dwindle(AREA, 0)).toEqual([]);
  });

  it('gives a single window the whole area', () => {
    expect(dwindle(AREA, 1)).toEqual([{ x: 0, y: 0, w: 1000, h: 600 }]);
  });

  it('splits two windows along the longer (horizontal) axis', () => {
    const [a, b] = dwindle(AREA, 2, 10);
    expect(a).toEqual({ x: 0, y: 0, w: 495, h: 600 });
    expect(b).toEqual({ x: 505, y: 0, w: 495, h: 600 });
    // gap preserved between them
    expect(b.x - (a.x + a.w)).toBe(10);
  });

  it('alternates split direction as the current region changes shape', () => {
    // After the first horizontal split, the remaining region is 495x600
    // (taller than wide) so the next split is vertical.
    const rects = dwindle(AREA, 3, 10);
    expect(rects).toHaveLength(3);
    const [, second, third] = rects;
    expect(second.x).toBe(third.x); // stacked vertically -> same x
    expect(third.y).toBeGreaterThan(second.y);
  });

  it('produces exactly `count` rectangles', () => {
    for (let n = 1; n <= 6; n += 1) {
      expect(dwindle(AREA, n, 8)).toHaveLength(n);
    }
  });

  it('keeps every tile inside the area', () => {
    for (const r of dwindle(AREA, 5, 10)) {
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.w).toBeLessThanOrEqual(1000);
      expect(r.y + r.h).toBeLessThanOrEqual(600);
    }
  });
});

describe('workspaceArea', () => {
  it('insets for the waybar and outer gap', () => {
    expect(workspaceArea(1000, 700, 40, 12)).toEqual({ x: 12, y: 52, w: 976, h: 636 });
  });
});
