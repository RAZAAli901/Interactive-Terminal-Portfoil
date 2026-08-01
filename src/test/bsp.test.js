import { describe, it, expect } from 'vitest';
import {
  leaf,
  firstLeaf,
  hasLeaf,
  countLeaves,
  allLeaves,
  insertLeaf,
  removeLeaf,
  setRatio,
  swapLeaves,
  splitArea,
  computeLayout,
  firstLeafInBiggest,
  tilingArea,
  RATIO_MIN,
  RATIO_MAX,
  GAP,
  MARGIN,
} from '../layout/bsp';

const AREA = { x: 12, y: 52, w: 1256, h: 736 };
const PORTRAIT = { x: 12, y: 52, w: 600, h: 900 };

/**
 * Build the dwindle cascade: every new window splits the previously opened one
 * (which is what "insert at the focused leaf" produces in practice).
 */
function build(n, area = AREA) {
  let tree = n > 0 ? leaf('w1') : null;
  let sid = 1;
  for (let i = 2; i <= n; i += 1) {
    const target = `w${i - 1}`;
    const { rects } = computeLayout(tree, area);
    const res = insertLeaf(tree, target, `w${i}`, rects[target], sid);
    tree = res.tree;
    sid = res.nextSid;
  }
  return tree;
}

const overlap = (a, b) => {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return Math.min(ox, oy);
};

describe('bsp constants', () => {
  it('matches the design tokens', () => {
    expect(RATIO_MIN).toBe(0.12);
    expect(RATIO_MAX).toBe(0.88);
    expect(GAP).toBe(8);
    expect(MARGIN).toBe(12);
  });
});

describe('tree helpers', () => {
  it('reads leaves out of an empty tree safely', () => {
    expect(firstLeaf(null)).toBeNull();
    expect(hasLeaf(null, 'w1')).toBe(false);
    expect(countLeaves(null)).toBe(0);
    expect(allLeaves(null)).toEqual([]);
    expect(computeLayout(null, AREA)).toEqual({ rects: {}, dividers: [] });
  });

  it('walks leaves left-to-right', () => {
    const tree = build(4);
    expect(countLeaves(tree)).toBe(4);
    expect(allLeaves(tree)).toEqual(['w1', 'w2', 'w3', 'w4']);
    expect(firstLeaf(tree)).toBe('w1');
    expect(hasLeaf(tree, 'w3')).toBe(true);
    expect(hasLeaf(tree, 'nope')).toBe(false);
  });

  it('seeds a tree when inserting into nothing', () => {
    const { tree, nextSid } = insertLeaf(null, null, 'w1', AREA, 1);
    expect(tree).toEqual({ id: 'w1' });
    expect(nextSid).toBe(1); // no split was created, so no sid consumed
  });
});

describe('computeLayout — dwindle cascade', () => {
  it('gives a single window the whole area', () => {
    const { rects, dividers } = computeLayout(build(1), AREA);
    expect(rects).toEqual({ w1: AREA });
    expect(dividers).toEqual([]);
  });

  it('splits two windows left/right in a landscape area', () => {
    const { rects } = computeLayout(build(2), AREA);
    expect(rects.w1).toEqual({ x: 12, y: 52, w: 624, h: 736 });
    expect(rects.w2).toEqual({ x: 644, y: 52, w: 624, h: 736 });
    expect(rects.w2.x - (rects.w1.x + rects.w1.w)).toBe(GAP);
    expect(rects.w1.y).toBe(rects.w2.y);
  });

  it('splits two windows top/bottom in a portrait area', () => {
    const { rects } = computeLayout(build(2, PORTRAIT), PORTRAIT);
    expect(rects.w1.x).toBe(rects.w2.x);
    expect(rects.w1.w).toBe(PORTRAIT.w);
    expect(rects.w2.w).toBe(PORTRAIT.w);
    expect(rects.w2.y - (rects.w1.y + rects.w1.h)).toBe(GAP);
  });

  it('stacks the right pane on the third window', () => {
    const { rects } = computeLayout(build(3), AREA);
    // w1 keeps the left half
    expect(rects.w1).toEqual({ x: 12, y: 52, w: 624, h: 736 });
    // the right pane (624x736, taller than wide) splits into top/bottom
    expect(rects.w2.x).toBe(rects.w3.x);
    expect(rects.w2.w).toBe(rects.w3.w);
    expect(rects.w3.y).toBeGreaterThan(rects.w2.y);
    expect(rects.w3.y - (rects.w2.y + rects.w2.h)).toBe(GAP);
  });

  it('splits the bottom-right pane side-by-side on the fourth window', () => {
    const { rects } = computeLayout(build(4), AREA);
    expect(rects.w1).toEqual({ x: 12, y: 52, w: 624, h: 736 });
    expect(rects.w2.x).toBe(644);
    // w3/w4 share the bottom-right row
    expect(rects.w3.y).toBe(rects.w4.y);
    expect(rects.w3.h).toBe(rects.w4.h);
    expect(rects.w4.x - (rects.w3.x + rects.w3.w)).toBe(GAP);
  });

  it('never overlaps any two panes, for 2..8 windows', () => {
    for (let n = 2; n <= 8; n += 1) {
      const { rects } = computeLayout(build(n), AREA);
      const ids = Object.keys(rects);
      expect(ids).toHaveLength(n);
      for (let i = 0; i < ids.length; i += 1) {
        for (let j = i + 1; j < ids.length; j += 1) {
          // <= 1 allows for rounding slack; a real overlap is much larger
          expect(overlap(rects[ids[i]], rects[ids[j]])).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('keeps adjacent panes exactly GAP apart', () => {
    for (let n = 2; n <= 8; n += 1) {
      const { rects } = computeLayout(build(n), AREA);
      const ids = Object.keys(rects);
      for (let i = 0; i < ids.length; i += 1) {
        for (let j = i + 1; j < ids.length; j += 1) {
          const a = rects[ids[i]];
          const b = rects[ids[j]];
          const dx = Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w);
          const dy = Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h);
          // panes are separated on at least one axis, by no less than the gap
          expect(Math.max(dx, dy)).toBeGreaterThanOrEqual(GAP);
        }
      }
    }
  });

  it('is separated by exactly GAP at every split boundary', () => {
    const tree = build(6);
    const seen = [];
    const check = (node, rect) => {
      if (node.id != null) return;
      const [a1, a2] = splitArea(node, rect);
      if (node.dir === 'row') seen.push(a2.x - (a1.x + a1.w));
      else seen.push(a2.y - (a1.y + a1.h));
      check(node.children[0], a1);
      check(node.children[1], a2);
    };
    check(tree, AREA);
    expect(seen).toHaveLength(5);
    for (const g of seen) expect(g).toBe(GAP);
  });

  it('keeps every pane inside the tiling area, for 1..8 windows', () => {
    for (let n = 1; n <= 8; n += 1) {
      const { rects } = computeLayout(build(n), AREA);
      for (const id of Object.keys(rects)) {
        const r = rects[id];
        expect(r.x).toBeGreaterThanOrEqual(AREA.x);
        expect(r.y).toBeGreaterThanOrEqual(AREA.y);
        expect(r.x + r.w).toBeLessThanOrEqual(AREA.x + AREA.w);
        expect(r.y + r.h).toBeLessThanOrEqual(AREA.y + AREA.h);
        expect(r.w).toBeGreaterThan(0);
        expect(r.h).toBeGreaterThan(0);
      }
    }
  });
});

describe('insertLeaf', () => {
  it('picks the split direction from the target rect', () => {
    const wide = insertLeaf(leaf('a'), 'a', 'b', { x: 0, y: 0, w: 400, h: 200 }, 1).tree;
    expect(wide.dir).toBe('row');
    const tall = insertLeaf(leaf('a'), 'a', 'b', { x: 0, y: 0, w: 200, h: 400 }, 1).tree;
    expect(tall.dir).toBe('col');
    // square ties break to 'row'
    const square = insertLeaf(leaf('a'), 'a', 'b', { x: 0, y: 0, w: 300, h: 300 }, 1).tree;
    expect(square.dir).toBe('row');
  });

  it('gives each new split ratio 0.5 and a fresh sid', () => {
    const first = insertLeaf(leaf('w1'), 'w1', 'w2', AREA, 7);
    expect(first.tree.ratio).toBe(0.5);
    expect(first.tree.sid).toBe(7);
    expect(first.nextSid).toBe(8);

    const { rects } = computeLayout(first.tree, AREA);
    const second = insertLeaf(first.tree, 'w2', 'w3', rects.w2, first.nextSid);
    expect(second.nextSid).toBe(9);
    const sids = [];
    const collect = (n) => {
      if (n.id != null) return;
      sids.push(n.sid);
      n.children.forEach(collect);
    };
    collect(second.tree);
    expect(new Set(sids).size).toBe(sids.length);
  });

  it('does not mutate the input tree', () => {
    const tree = build(3);
    const snapshot = JSON.parse(JSON.stringify(tree));
    const { rects } = computeLayout(tree, AREA);
    const { tree: next } = insertLeaf(tree, 'w2', 'w4', rects.w2, 99);
    expect(tree).toEqual(snapshot);
    expect(next).not.toBe(tree);
    expect(countLeaves(tree)).toBe(3);
    expect(countLeaves(next)).toBe(4);
  });

  it('leaves the tree alone when the target is missing', () => {
    const tree = build(2);
    const { tree: next, nextSid } = insertLeaf(tree, 'ghost', 'w9', AREA, 5);
    expect(countLeaves(next)).toBe(2);
    expect(hasLeaf(next, 'w9')).toBe(false);
    expect(nextSid).toBe(5);
  });
});

describe('removeLeaf', () => {
  it('collapses the parent split so the survivor reclaims the full rect', () => {
    const tree = build(2);
    const next = removeLeaf(tree, 'w2');
    expect(next).toEqual({ id: 'w1' });
    const { rects, dividers } = computeLayout(next, AREA);
    expect(rects.w1).toEqual(AREA);
    expect(dividers).toEqual([]);
  });

  it('promotes a whole subtree into the parent slot', () => {
    const tree = build(4);
    const next = removeLeaf(tree, 'w1');
    expect(countLeaves(next)).toBe(3);
    expect(allLeaves(next)).toEqual(['w2', 'w3', 'w4']);
    const { rects } = computeLayout(next, AREA);
    // the surviving subtree now owns the whole area
    expect(rects.w2).toEqual({ x: 12, y: 52, w: 1256, h: 364 });
    expect(rects.w3.y).toBe(424);
    expect(rects.w4.x - (rects.w3.x + rects.w3.w)).toBe(GAP);
  });

  it('empties the tree when the last leaf goes and ignores unknown ids', () => {
    expect(removeLeaf(leaf('w1'), 'w1')).toBeNull();
    expect(removeLeaf(null, 'w1')).toBeNull();
    const tree = build(3);
    expect(removeLeaf(tree, 'ghost')).toBe(tree);
    const snapshot = JSON.parse(JSON.stringify(tree));
    removeLeaf(tree, 'w2');
    expect(tree).toEqual(snapshot);
  });
});

describe('swapLeaves', () => {
  it('exchanges two ids without moving any geometry', () => {
    const tree = build(4);
    const before = computeLayout(tree, AREA);
    const swapped = swapLeaves(tree, 'w1', 'w4');
    const after = computeLayout(swapped, AREA);

    expect(after.rects.w1).toEqual(before.rects.w4);
    expect(after.rects.w4).toEqual(before.rects.w1);
    expect(after.rects.w2).toEqual(before.rects.w2);
    expect(after.rects.w3).toEqual(before.rects.w3);
    expect(after.dividers).toEqual(before.dividers);
    expect(allLeaves(swapped)).toEqual(['w4', 'w2', 'w3', 'w1']);
  });

  it('does not mutate the input tree', () => {
    const tree = build(3);
    const snapshot = JSON.parse(JSON.stringify(tree));
    swapLeaves(tree, 'w1', 'w3');
    expect(tree).toEqual(snapshot);
  });
});

describe('setRatio', () => {
  it('clamps to the design bounds', () => {
    const tree = build(2);
    expect(setRatio(tree, tree.sid, 5).ratio).toBe(RATIO_MAX);
    expect(setRatio(tree, tree.sid, -3).ratio).toBe(RATIO_MIN);
    expect(setRatio(tree, tree.sid, 0.33).ratio).toBe(0.33);
  });

  it('only touches the targeted sid', () => {
    const tree = build(3);
    const inner = tree.children[1];
    const next = setRatio(tree, inner.sid, 0.8);
    expect(next.ratio).toBe(tree.ratio);
    expect(next.children[1].ratio).toBe(0.8);
    expect(next.children[0]).toBe(tree.children[0]);

    const { rects } = computeLayout(next, AREA);
    expect(rects.w1).toEqual({ x: 12, y: 52, w: 624, h: 736 });
    expect(rects.w2.h).toBe(Math.round((736 - GAP) * 0.8));
  });

  it('is a no-op for unknown sids and leaf roots', () => {
    const tree = build(2);
    expect(setRatio(tree, 999, 0.3)).toBe(tree);
    expect(setRatio(leaf('w1'), 1, 0.3)).toEqual({ id: 'w1' });
    expect(setRatio(null, 1, 0.3)).toBeNull();
  });
});

describe('dividers', () => {
  it('emits one divider per split', () => {
    for (let n = 1; n <= 8; n += 1) {
      const { dividers } = computeLayout(build(n), AREA);
      expect(dividers).toHaveLength(Math.max(0, n - 1));
      expect(new Set(dividers.map((d) => d.sid)).size).toBe(dividers.length);
    }
  });

  it('places a row divider vertically at the child boundary, spanning the parent height', () => {
    const tree = build(2);
    const { dividers } = computeLayout(tree, AREA);
    expect(dividers[0]).toEqual({
      sid: tree.sid,
      dir: 'row',
      x: 636, // AREA.x + w1
      y: AREA.y,
      size: GAP,
      len: AREA.h,
      prect: AREA,
    });
  });

  it('places a col divider horizontally at the child boundary, spanning the parent width', () => {
    const tree = build(2, PORTRAIT);
    const { dividers } = computeLayout(tree, PORTRAIT);
    const [d] = dividers;
    expect(d.dir).toBe('col');
    expect(d.x).toBe(PORTRAIT.x);
    expect(d.y).toBe(PORTRAIT.y + Math.round((PORTRAIT.h - GAP) * 0.5));
    expect(d.len).toBe(PORTRAIT.w);
    expect(d.size).toBe(GAP);
    expect(d.prect).toEqual(PORTRAIT);
  });

  it('gives nested dividers the parent rect they were split from', () => {
    const tree = build(3);
    const { rects, dividers } = computeLayout(tree, AREA);
    const nested = dividers.find((d) => d.sid === tree.children[1].sid);
    expect(nested.dir).toBe('col');
    expect(nested.prect).toEqual({ x: 644, y: 52, w: 624, h: 736 });
    expect(nested.y).toBe(rects.w2.y + rects.w2.h);
  });
});

describe('firstLeafInBiggest', () => {
  it('returns the largest pane', () => {
    const { rects } = computeLayout(build(3), AREA);
    expect(firstLeafInBiggest(rects)).toBe('w1');
  });

  it('handles an empty layout', () => {
    expect(firstLeafInBiggest({})).toBeNull();
  });
});

describe('tilingArea', () => {
  it('insets below the bar and by the margin on every edge', () => {
    expect(tilingArea(1280, 800, 40, 12)).toEqual({ x: 12, y: 52, w: 1256, h: 736 });
  });

  it('defaults to the design tokens', () => {
    expect(tilingArea(1280, 800)).toEqual({ x: MARGIN, y: 40 + MARGIN, w: 1256, h: 736 });
  });
});
