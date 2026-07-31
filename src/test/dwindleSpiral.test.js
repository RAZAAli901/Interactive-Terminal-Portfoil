import { describe, it, expect } from 'vitest';
import { dwindle } from '../layout/dwindle';

const AREA = { x: 0, y: 0, w: 1200, h: 800 };
const overlaps = (a, b) => {
  const ox = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const oy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return ox > 1 && oy > 1;
};

describe('dwindle spiral', () => {
  it('produces no overlapping tiles for 2..6 windows', () => {
    for (let n = 2; n <= 6; n += 1) {
      const rects = dwindle(AREA, n, 10);
      for (let i = 0; i < rects.length; i += 1) {
        for (let j = i + 1; j < rects.length; j += 1) {
          expect(overlaps(rects[i], rects[j]), `n=${n} tiles ${i},${j} overlap`).toBe(false);
        }
      }
    }
  });

  it('keeps a gap between the first two tiles', () => {
    const [a, b] = dwindle(AREA, 2, 12);
    expect(b.x - (a.x + a.w)).toBe(12);
  });

  it('alternates orientation (3rd split is vertical after a wide area)', () => {
    const rects = dwindle(AREA, 3, 10);
    // remaining region after first split is taller-than-wide -> stacked
    expect(rects[1].x).toBe(rects[2].x);
    expect(rects[2].y).toBeGreaterThan(rects[1].y);
  });

  it('every tile has positive dimensions', () => {
    for (const r of dwindle(AREA, 6, 10)) {
      expect(r.w).toBeGreaterThan(0);
      expect(r.h).toBeGreaterThan(0);
    }
  });
});
