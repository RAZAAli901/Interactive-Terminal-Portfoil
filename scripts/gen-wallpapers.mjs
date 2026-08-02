/**
 * Original wallpaper generator.
 *
 * Every wallpaper this emits is hand-defined vector artwork — layered gradients,
 * procedural ridgelines, sine-wave seas, perspective grids and silhouette scenes
 * — parameterised by the ricing palettes people actually use, plus a set of
 * anime-aesthetic scenes (torii at dusk, sakura at night, a coastal dawn, neon
 * rain). Nothing is traced from or derived from a copyrighted image, so the repo
 * carries no third-party art licensing. Output is deterministic (seeded per id)
 * so re-running the script produces byte-identical SVGs and clean diffs.
 *
 *   node scripts/gen-wallpapers.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 1920, H = 1080;
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/wallpapers');

/* ── Seeded RNG ─────────────────────────────────────────────────────────── */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFromId(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const rr = (r, a, b) => a + (b - a) * r();

/* ── Colour helpers ─────────────────────────────────────────────────────── */
function hex2rgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
const rgb2hex = (r) => '#' + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (h1, h2, t) => { const a = hex2rgb(h1), b = hex2rgb(h2); return rgb2hex(a.map((v, i) => v + (b[i] - v) * t)); };

/* ── SVG primitives ─────────────────────────────────────────────────────── */
const svg = (defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">\n` +
  `<defs>${defs}</defs>\n${body}\n</svg>\n`;

const linV = (id, stops) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
  stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('') +
  `</linearGradient>`;

const radial = (id, stops, attrs = '') =>
  `<radialGradient id="${id}" ${attrs}>` +
  stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('') +
  `</radialGradient>`;

const VIG = radial('vig', [[0.5, '#000', 0], [1, '#05060a', 0.5]], 'cx=".5" cy=".55" r=".85"');
const vig = () => `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;

function stars(rng, n, color, maxY = 520) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = rr(rng, 0, W), y = rr(rng, 0, maxY), r = rr(rng, 0.6, 1.9), o = rr(rng, 0.1, 0.55);
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${color}" opacity="${o.toFixed(2)}"/>`;
  }
  return s;
}

/** A jagged silhouette ridgeline filled to the bottom of the frame. */
function ridge(rng, baseY, amp, fill, n = 15) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push([-30 + 1980 * (i / n), baseY - rr(rng, 0, amp)]);
  let d = `M-30 ${H} L${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L')} L1950 ${H} Z`;
  return `<path d="${d}" fill="${fill}"/>`;
}

/** A soft rolling-hill silhouette (fewer, gentler undulations). */
function hill(rng, baseY, amp, fill) {
  let d = `M-30 ${H} L-30 ${baseY}`;
  for (let x = -30; x <= 1950; x += 60) d += ` L${x} ${(baseY - amp * Math.sin(x / rr(rng, 260, 340) + rng() * 6) * 0.5 - rr(rng, 0, amp * 0.3)).toFixed(1)}`;
  d += ` L1950 ${H} Z`;
  return `<path d="${d}" fill="${fill}"/>`;
}

const bird = (x, y, s, c) => `<path d="M${x} ${y} q ${s} ${-s * 0.7} ${s * 2} 0 q ${s} ${-s * 0.7} ${s * 2} 0" fill="none" stroke="${c}" stroke-width="${(s * 0.28).toFixed(1)}" stroke-linecap="round" opacity="0.55"/>`;

/* ── Archetypes ─────────────────────────────────────────────────────────── */
function skyStops(sky) {
  return [[0, sky[0]], [0.45, sky[1]], [0.78, sky[2] || sky[1]], [1, sky[3] || sky[2] || sky[1]]];
}

function mountains(pal, rng) {
  const back = mix(pal.sky[2] || pal.sky[1], pal.accent, 0.14);
  const defs = linV('sky', skyStops(pal.sky)) +
    radial('moon', [[0, pal.accent, 0.4], [0.55, pal.accent, 0.07], [1, pal.accent, 0]]) +
    linV('haze', [[0, pal.accent, 0], [1, pal.accent, 0.1]]) + VIG;
  const mx = rr(rng, 380, 1540), my = rr(rng, 170, 300);
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  b += `<ellipse cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" rx="520" ry="360" fill="url(#moon)"/>`;
  b += `<circle cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" r="${rr(rng, 34, 58).toFixed(0)}" fill="${mix(pal.star, pal.accent, 0.3)}" opacity="0.9"/>`;
  b += stars(rng, 150, pal.star, my + 120);
  const layers = [[markN(640), 120, 0.24], [markN(720), 150, 0.44], [markN(812), 175, 0.62], [markN(910), 200, 0.82]];
  function markN(v) { return v; }
  for (const [y, amp, dk] of layers) b += ridge(rng, y, amp, mix(back, '#05060a', dk));
  b += `<rect y="560" width="${W}" height="520" fill="url(#haze)"/>`;
  b += vig();
  return svg(defs, b);
}

function hills(pal, rng) {
  const base = mix(pal.sky[2] || pal.sky[1], pal.accent, 0.16);
  const defs = linV('sky', skyStops(pal.sky)) +
    radial('sun', [[0, mix(pal.warm, '#fff', 0.3), 0.5], [0.6, pal.warm, 0.08], [1, pal.warm, 0]]) + VIG;
  const sx = rr(rng, 500, 1420);
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  b += `<ellipse cx="${sx.toFixed(0)}" cy="360" rx="560" ry="420" fill="url(#sun)"/>`;
  b += stars(rng, 80, pal.star, 300);
  for (let i = 0; i < 5; i++) b += hill(rng, 560 + i * 100, 90 + i * 22, mix(base, '#06070b', 0.2 + i * 0.16));
  b += vig();
  return svg(defs, b);
}

function waves(pal, rng) {
  const wave = pal.wave || pal.accent;
  const defs = linV('sky', skyStops(pal.sky)) +
    radial('gl', [[0, pal.accent2, 0.28], [0.6, pal.accent2, 0.05], [1, pal.accent2, 0]]) + VIG;
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  b += `<ellipse cx="${rr(rng, 500, 1400).toFixed(0)}" cy="${rr(rng, 240, 420).toFixed(0)}" rx="640" ry="360" fill="url(#gl)"/>`;
  b += stars(rng, 90, pal.star, 420);
  const cols = [pal.accent2, pal.accent, wave, mix(wave, '#05060a', 0.4), mix(wave, '#05060a', 0.65)];
  for (let i = 0; i < cols.length; i++) {
    const midY = 470 + i * 118, amp = rr(rng, 26, 46), wl = rr(rng, 150, 240), ph = rng() * 6.28;
    let d = `M-30 ${H} L-30 ${midY}`;
    for (let x = -30; x <= 1950; x += 24) d += ` L${x} ${(midY + amp * Math.sin(x / wl + ph)).toFixed(1)}`;
    d += ` L1950 ${H} Z`;
    b += `<path d="${d}" fill="${cols[i]}" opacity="${(0.5 - i * 0.05).toFixed(2)}"/>`;
  }
  b += vig();
  return svg(defs, b);
}

function synthwave(pal, rng) {
  const grid = pal.grid || pal.accent;
  const horizon = 566;
  const defs = linV('sky', skyStops(pal.sky)) +
    linV('sun', [[0, mix(pal.warm, '#fff', 0.25)], [0.5, pal.warm], [1, pal.accent2]]) +
    linV('floor', [[0, mix(pal.sky[3] || pal.sky[2], '#000', 0.3)], [1, '#05030d']]) + VIG;
  let b = `<rect width="${W}" height="${horizon}" fill="url(#sky)"/>`;
  b += stars(rng, 140, pal.star, horizon - 40);
  // sun with scanline gaps
  b += `<clipPath id="sc"><circle cx="960" cy="${horizon - 96}" r="176"/></clipPath>`;
  b += `<g clip-path="url(#sc)"><rect x="784" y="${horizon - 272}" width="352" height="352" fill="url(#sun)"/>`;
  for (let i = 0; i < 7; i++) b += `<rect x="784" y="${horizon - 150 + i * 22}" width="352" height="${4 + i * 2}" fill="${pal.sky[1]}"/>`;
  b += `</g>`;
  // horizon mountains
  b += ridge(rng, horizon, 70, mix(pal.accent2, '#05030d', 0.55), 20);
  // floor + perspective grid
  b += `<rect y="${horizon}" width="${W}" height="${H - horizon}" fill="url(#floor)"/>`;
  b += `<line x1="0" y1="${horizon}" x2="${W}" y2="${horizon}" stroke="${grid}" stroke-width="2" opacity="0.5"/>`;
  for (let i = -14; i <= 14; i++) {
    const x = 960 + i * 150;
    b += `<line x1="960" y1="${horizon}" x2="${x}" y2="${H}" stroke="${grid}" stroke-width="1.4" opacity="0.32"/>`;
  }
  for (let i = 1; i <= 16; i++) {
    const y = horizon + Math.pow(i / 16, 1.9) * (H - horizon);
    b += `<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="${grid}" stroke-width="1.4" opacity="${(0.34 - i * 0.014).toFixed(2)}"/>`;
  }
  b += vig();
  return svg(defs, b);
}

function toriiSunset(cfg, rng) {
  // cfg: { sky:[deep,mid,glow,pale], sun, mtn, water, torii }
  const waterY = 742;
  const defs = linV('sky', [[0, cfg.sky[0]], [0.4, cfg.sky[1]], [0.72, cfg.sky[2]], [1, cfg.sky[3]]]) +
    radial('sun', [[0, mix(cfg.sun, '#fff', 0.35)], [0.35, cfg.sun], [0.6, cfg.sun, 0.5], [1, cfg.sun, 0]]) +
    linV('water', [[0, cfg.sky[3]], [1, mix(cfg.water, '#05060a', 0.4)]]) + VIG;
  const sunX = rr(rng, 780, 1160), sunY = 560;
  let b = `<rect width="${W}" height="${waterY}" fill="url(#sky)"/>`;
  b += `<circle cx="${sunX.toFixed(0)}" cy="${sunY}" r="430" fill="url(#sun)"/>`;
  b += `<circle cx="${sunX.toFixed(0)}" cy="${sunY}" r="150" fill="${mix(cfg.sun, '#fff', 0.2)}" opacity="0.92"/>`;
  b += ridge(rng, 640, 90, mix(cfg.mtn, '#000', 0.15), 22);
  b += ridge(rng, 700, 80, mix(cfg.mtn, '#000', 0.4), 22);
  // water
  b += `<rect y="${waterY}" width="${W}" height="${H - waterY}" fill="url(#water)"/>`;
  b += `<rect x="${(sunX - 60).toFixed(0)}" y="${waterY}" width="120" height="${H - waterY}" fill="${cfg.sun}" opacity="0.18"/>`;
  for (let i = 0; i < 26; i++) {
    const y = waterY + 10 + i * 12, w = rr(rng, 40, 260), x = rr(rng, 0, W - w);
    b += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="3" fill="${mix(cfg.sun, cfg.water, 0.5)}" opacity="${(0.22 - i * 0.006).toFixed(2)}"/>`;
  }
  // torii gate (silhouette): two posts, kasagi (curved top beam), nuki (second beam)
  const gx = rr(rng, 1120, 1420), postW = 34, top = 452, baseY = 968, span = 300, t = cfg.torii;
  const L = gx - span / 2, R = gx + span / 2;
  b += `<g fill="${t}">`;
  b += `<rect x="${(L - postW / 2).toFixed(0)}" y="${top}" width="${postW}" height="${baseY - top}"/>`;
  b += `<rect x="${(R - postW / 2).toFixed(0)}" y="${top}" width="${postW}" height="${baseY - top}"/>`;
  b += `<path d="M${L - 78} ${top} q ${gx - (L - 78)} -46 ${span + 156} 0 l -14 34 q ${-(span + 128) / 2} -30 ${-(span + 128)} 0 Z"/>`;
  b += `<rect x="${(L - 40).toFixed(0)}" y="${top + 74}" width="${(span + 80).toFixed(0)}" height="26"/>`;
  b += `<rect x="${(gx - 16).toFixed(0)}" y="${top + 4}" width="32" height="70"/>`;
  b += `</g>`;
  for (let i = 0; i < 5; i++) b += bird(rr(rng, 200, 900), rr(rng, 180, 340), rr(rng, 9, 15), mix(cfg.mtn, '#000', 0.3));
  b += vig();
  return svg(defs, b);
}

function sakuraNight(cfg, rng) {
  // cfg: { sky:[...], moon, hill, trunk, petal, petal2 }
  const defs = linV('sky', skyStops(cfg.sky)) +
    radial('moon', [[0, mix(cfg.moon, '#fff', 0.4), 0.9], [0.25, cfg.moon, 0.5], [1, cfg.moon, 0]]) + VIG;
  const mx = rr(rng, 300, 620), my = rr(rng, 200, 320);
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  b += `<ellipse cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" rx="360" ry="360" fill="url(#moon)"/>`;
  b += `<circle cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" r="78" fill="${mix(cfg.moon, '#fff', 0.55)}"/>`;
  b += stars(rng, 120, mix(cfg.moon, '#fff', 0.4), my + 80);
  b += hill(rng, 880, 120, mix(cfg.hill, '#05060a', 0.35));
  b += hill(rng, 970, 90, mix(cfg.hill, '#05060a', 0.6));
  // tree: trunk + branches from bottom-right
  const bx = 1620;
  b += `<g stroke="${cfg.trunk}" fill="none" stroke-linecap="round">`;
  b += `<path d="M${bx} ${H} C ${bx - 20} 880 ${bx - 120} 760 ${bx - 250} 660" stroke-width="26"/>`;
  const branches = [];
  for (let i = 0; i < 9; i++) {
    const sx = bx - rr(rng, 40, 250), sy = rr(rng, 640, 900);
    const ex = sx - rr(rng, 120, 360), ey = sy - rr(rng, 80, 240);
    branches.push([ex, ey]);
    b += `<path d="M${sx.toFixed(0)} ${sy.toFixed(0)} Q ${((sx + ex) / 2 - 30).toFixed(0)} ${((sy + ey) / 2).toFixed(0)} ${ex.toFixed(0)} ${ey.toFixed(0)}" stroke-width="${rr(rng, 5, 11).toFixed(1)}"/>`;
  }
  b += `</g>`;
  // blossoms clustered at branch ends + along canopy
  for (const [ex, ey] of branches) {
    for (let k = 0; k < 26; k++) {
      const x = ex + rr(rng, -90, 90), y = ey + rr(rng, -80, 70), r = rr(rng, 3, 8);
      b += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${rng() < 0.5 ? cfg.petal : cfg.petal2}" opacity="${rr(rng, 0.55, 0.95).toFixed(2)}"/>`;
    }
  }
  // falling petals
  for (let i = 0; i < 60; i++) {
    const x = rr(rng, 0, W), y = rr(rng, 200, H), a = rr(rng, 0, 360);
    b += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="6" ry="3.4" fill="${rng() < 0.5 ? cfg.petal : cfg.petal2}" opacity="${rr(rng, 0.25, 0.7).toFixed(2)}" transform="rotate(${a.toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }
  b += vig();
  return svg(defs, b);
}

function coastDawn(cfg, rng) {
  // cfg: { sky:[...], sun, sea, cloud, head }
  const seaY = 632;
  const defs = linV('sky', [[0, cfg.sky[0]], [0.5, cfg.sky[1]], [0.85, cfg.sky[2]], [1, cfg.sky[3]]]) +
    radial('sun', [[0, mix(cfg.sun, '#fff', 0.5), 0.95], [0.4, cfg.sun, 0.4], [1, cfg.sun, 0]]) +
    linV('sea', [[0, mix(cfg.sky[3], cfg.sea, 0.5)], [1, mix(cfg.sea, '#05060a', 0.35)]]) + VIG;
  const sx = rr(rng, 720, 1200);
  let b = `<rect width="${W}" height="${seaY}" fill="url(#sky)"/>`;
  b += `<ellipse cx="${sx.toFixed(0)}" cy="${seaY}" rx="620" ry="520" fill="url(#sun)"/>`;
  b += `<circle cx="${sx.toFixed(0)}" cy="${(seaY - 30).toFixed(0)}" r="96" fill="${mix(cfg.sun, '#fff', 0.35)}" opacity="0.9"/>`;
  for (let i = 0; i < 7; i++) {
    const cx = rr(rng, 100, 1820), cy = rr(rng, 120, 460), rx = rr(rng, 120, 320);
    b += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${(rx * 0.26).toFixed(0)}" fill="${cfg.cloud}" opacity="${rr(rng, 0.1, 0.28).toFixed(2)}"/>`;
  }
  // headland silhouette
  b += `<path d="M-30 ${seaY} q 300 -150 620 -110 q 220 30 420 4 L1010 ${seaY} Z" fill="${mix(cfg.head, '#05060a', 0.4)}" opacity="0.9"/>`;
  b += `<rect y="${seaY}" width="${W}" height="${H - seaY}" fill="url(#sea)"/>`;
  b += `<rect x="${(sx - 70).toFixed(0)}" y="${seaY}" width="140" height="${H - seaY}" fill="${cfg.sun}" opacity="0.22"/>`;
  for (let i = 0; i < 22; i++) {
    const y = seaY + 12 + i * 14, w = rr(rng, 60, 300), x = rr(rng, 0, W - w);
    b += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="3" fill="${mix(cfg.sun, '#fff', 0.3)}" opacity="${(0.26 - i * 0.008).toFixed(2)}"/>`;
  }
  for (let i = 0; i < 4; i++) b += bird(rr(rng, 300, 1100), rr(rng, 150, 320), rr(rng, 8, 13), cfg.head);
  b += vig();
  return svg(defs, b);
}

function neonRain(cfg, rng) {
  // cfg: { sky:[...], neon, neon2, bld }
  const defs = linV('sky', skyStops(cfg.sky)) +
    radial('g1', [[0, cfg.neon, 0.3], [0.6, cfg.neon, 0.05], [1, cfg.neon, 0]]) +
    radial('g2', [[0, cfg.neon2, 0.28], [0.6, cfg.neon2, 0.05], [1, cfg.neon2, 0]]) + VIG;
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  b += `<ellipse cx="1240" cy="740" rx="900" ry="320" fill="url(#g1)"/><ellipse cx="500" cy="800" rx="720" ry="280" fill="url(#g2)"/>`;
  b += stars(rng, 60, cfg.neon2, 360);
  // two skyline bands with lit windows
  for (let band = 0; band < 2; band++) {
    const baseTop = 560 + band * 120, fill = mix(cfg.bld, '#05060a', band ? 0.5 : 0.25);
    let x = -30;
    while (x < 1950) {
      const w = rr(rng, 70, 150), top = baseTop + rr(rng, -70, 90);
      b += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${w.toFixed(0)}" height="${(H - top).toFixed(0)}" fill="${fill}"/>`;
      for (let wy = top + 16; wy < H - 30; wy += 26) {
        for (let wx = x + 12; wx < x + w - 12; wx += 22) {
          if (rng() < 0.32) b += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="7" height="10" fill="${rng() < 0.5 ? cfg.neon : cfg.neon2}" opacity="${rr(rng, 0.3, 0.8).toFixed(2)}"/>`;
        }
      }
      x += w + rr(rng, 6, 20);
    }
  }
  // rain
  for (let i = 0; i < 260; i++) {
    const x = rr(rng, 0, W), y = rr(rng, 0, H), len = rr(rng, 24, 60);
    b += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - 10).toFixed(0)}" y2="${(y + len).toFixed(0)}" stroke="${cfg.neon2}" stroke-width="1" opacity="${rr(rng, 0.05, 0.2).toFixed(2)}"/>`;
  }
  b += vig();
  return svg(defs, b);
}

/* ── Palettes ───────────────────────────────────────────────────────────── */
const P = {
  kanagawa: { sky: ['#16161d', '#1f1f28', '#2a2a37', '#363646'], accent: '#7e9cd8', accent2: '#957fb8', warm: '#e6c384', star: '#dcd7ba', wave: '#658594' },
  tokyoStorm: { sky: ['#12131f', '#181a2b', '#1f2335', '#24283b'], accent: '#7aa2f7', accent2: '#7dcfff', warm: '#ff9e64', star: '#c0caf5' },
  macchiato: { sky: ['#181926', '#1e2030', '#24273a', '#363a4f'], accent: '#8aadf4', accent2: '#c6a0f6', warm: '#f5a97f', star: '#cad3f5', wave: '#7dc4e4' },
  frappe: { sky: ['#232634', '#292c3c', '#303446', '#414559'], accent: '#8caaee', accent2: '#ca9ee6', warm: '#ef9f76', star: '#c6d0f5' },
  synth: { sky: ['#0d0221', '#1a0a3a', '#2d0b52', '#41197a'], accent: '#ff2d95', accent2: '#00e5ff', warm: '#ff9e64', star: '#ffffff', grid: '#ff2d95' },
  synthDawn: { sky: ['#160d2e', '#2a1150', '#5a1e6e', '#b23a6b'], accent: '#ff6ec7', accent2: '#ffd36e', warm: '#ffd36e', star: '#ffe9f5', grid: '#ff6ec7' },
  dracula: { sky: ['#191a21', '#21222c', '#282a36', '#343746'], accent: '#bd93f9', accent2: '#ff79c6', warm: '#ffb86c', star: '#f8f8f2', wave: '#8be9fd' },
  gruvbox: { sky: ['#1d2021', '#282828', '#3c3836', '#504945'], accent: '#83a598', accent2: '#d3869b', warm: '#fabd2f', star: '#ebdbb2' },
  nord: { sky: ['#2e3440', '#3b4252', '#434c5e', '#4c566a'], accent: '#88c0d0', accent2: '#81a1c1', warm: '#ebcb8b', star: '#eceff4', wave: '#5e81ac' },
  everforest: { sky: ['#232a2e', '#2d353b', '#343f44', '#3d484d'], accent: '#a7c080', accent2: '#7fbbb3', warm: '#dbbc7f', star: '#d3c6aa' },
  rosePineMoon: { sky: ['#232136', '#2a273f', '#393552', '#44415a'], accent: '#9ccfd8', accent2: '#c4a7e7', warm: '#f6c177', star: '#e0def4', wave: '#3e8fb0' },
};

/* Anime scene configs (warm/atmospheric, palette-agnostic). */
const A = {
  toriiDusk: { sky: ['#241539', '#5a2a63', '#a84a5f', '#e88a4e'], sun: '#ffcf6b', mtn: '#3a2140', water: '#5a2a63', torii: '#160a1e' },
  fujiSunset: { sky: ['#1f1636', '#4a2352', '#8a2f57', '#d76a4a'], sun: '#ffb765', mtn: '#2c1830', water: '#4a2352', torii: '#120a18' },
  sakuraNight: { sky: ['#141021', '#221a3a', '#312452', '#3a2c60'], moon: '#f6d7e0', hill: '#241a3a', trunk: '#1a1226', petal: '#ff9ec4', petal2: '#ffd1e6' },
  coastDawn: { sky: ['#123a5e', '#3f7ba8', '#9ac4d8', '#f4d8b0'], sun: '#ffe1a8', sea: '#1e5878', cloud: '#f6c9a0', head: '#10222f' },
  neonRain: { sky: ['#08060f', '#0f0b1e', '#160f2e', '#1c1440'], neon: '#ff2d95', neon2: '#00e5ff', bld: '#141026' },
};

/* ── Manifest of new wallpapers ─────────────────────────────────────────── */
const SPECS = [
  // Anime-aesthetic scenes
  { id: 'anime-torii-dusk', name: 'Torii Dusk', palette: 'Anime', make: (r) => toriiSunset(A.toriiDusk, r) },
  { id: 'anime-fuji-sunset', name: 'Crimson Fuji', palette: 'Anime', make: (r) => toriiSunset(A.fujiSunset, r) },
  { id: 'anime-sakura-night', name: 'Sakura Night', palette: 'Anime', make: (r) => sakuraNight(A.sakuraNight, r) },
  { id: 'anime-coast-dawn', name: 'Coastal Dawn', palette: 'Anime', make: (r) => coastDawn(A.coastDawn, r) },
  { id: 'anime-neon-rain', name: 'Neon Rain', palette: 'Anime', make: (r) => neonRain(A.neonRain, r) },
  // Kanagawa
  { id: 'kanagawa-wave', name: 'Seafoam', palette: 'Kanagawa', make: (r) => waves(P.kanagawa, r) },
  { id: 'kanagawa-peak', name: 'Lone Peak', palette: 'Kanagawa', make: (r) => mountains(P.kanagawa, r) },
  // Tokyo Night Storm
  { id: 'tokyo-storm-peaks', name: 'Storm Peaks', palette: 'Tokyo Night Storm', make: (r) => mountains(P.tokyoStorm, r) },
  // Catppuccin variants
  { id: 'catppuccin-macchiato-tide', name: 'Lavender Tide', palette: 'Catppuccin Macchiato', make: (r) => waves(P.macchiato, r) },
  { id: 'catppuccin-frappe-peaks', name: 'Frappé Ridges', palette: 'Catppuccin Frappé', make: (r) => mountains(P.frappe, r) },
  // Synthwave
  { id: 'synthwave-outrun', name: 'Outrun', palette: 'Synthwave', make: (r) => synthwave(P.synth, r) },
  { id: 'synthwave-retro', name: 'Retrowave', palette: 'Synthwave', make: (r) => synthwave(P.synthDawn, r) },
  // Dracula
  { id: 'dracula-tide', name: 'Nocturne Tide', palette: 'Dracula', make: (r) => waves(P.dracula, r) },
  // Gruvbox
  { id: 'gruvbox-peaks', name: 'Autumn Ridge', palette: 'Gruvbox', make: (r) => mountains(P.gruvbox, r) },
  // Nord
  { id: 'nord-fjord', name: 'Fjord', palette: 'Nord', make: (r) => mountains(P.nord, r) },
  // Rosé Pine Moon
  { id: 'rose-pine-moon-tide', name: 'Moonlit Tide', palette: 'Rosé Pine Moon', make: (r) => waves(P.rosePineMoon, r) },
  // Everforest
  { id: 'everforest-hills', name: 'Rolling Hills', palette: 'Everforest', make: (r) => hills(P.everforest, r) },
];

/* ── Emit ───────────────────────────────────────────────────────────────── */
mkdirSync(OUT, { recursive: true });
const manifest = [];
for (const s of SPECS) {
  const rng = mulberry32(seedFromId(s.id));
  const out = s.make(rng);
  const file = `${s.id}.svg`;
  writeFileSync(resolve(OUT, file), out);
  manifest.push(`  { id: '${s.id}', name: '${s.name}', palette: '${s.palette}', file: '${file}' },`);
}
console.log(`Wrote ${SPECS.length} wallpapers to ${OUT}\n`);
console.log(manifest.join('\n'));
