import { useEffect, useRef, useState } from 'react';
import styles from './NeuralCanvas.module.css';

const FALLBACK_ACCENT = [122, 162, 247]; // #7aa2f7
const NODE_FILL = 'rgba(125,207,255,0.55)';
const LINK_DIST = 158;   // px — pairs closer than this get a connecting line
const LINK_ALPHA = 0.26; // alpha at zero distance, faded out linearly
const MIN_NODES = 30;
const MAX_NODES = 85;
const AREA_PER_NODE = 17000;
const RESIZE_DEBOUNCE = 150;

/** Parse `#rgb` / `#rrggbb` into an [r, g, b] triple. Returns null if unparseable. */
function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex ?? '').trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const v = parseInt(h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/** True when the animation is allowed to run at all (reduced motion / low-power mode). */
function motionAllowed() {
  if (typeof document === 'undefined') return false;
  if (document.documentElement.dataset.perf === 'low') return false;
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Full-bleed animated neural-network wallpaper. Nodes drift, bounce off the
 * viewport edges and link up with accent-coloured lines when they get close.
 *
 * Purely decorative: fixed behind the shell with `pointer-events: none`.
 *
 * @param {object}  props
 * @param {boolean} [props.enabled=true] Set false to leave the canvas blank.
 * @param {string}  [props.accent]       Hex line colour; defaults to `--hypr-accent`.
 */
export default function NeuralCanvas({ enabled = true, accent }) {
  const canvasRef = useRef(null);
  const accentRef = useRef(FALLBACK_ACCENT);
  const [motionOk, setMotionOk] = useState(motionAllowed);

  // Parse the accent once per change; the draw loop only ever reads the ref, so
  // recolouring never restarts the animation.
  useEffect(() => {
    const raw = accent
      || getComputedStyle(document.documentElement).getPropertyValue('--hypr-accent');
    accentRef.current = hexToRgb(raw) || FALLBACK_ACCENT;
  }, [accent]);

  // Re-evaluate the motion gate when the OS preference or low-power mode flips.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionOk(motionAllowed());
    mq?.addEventListener?.('change', sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-perf'] });
    return () => {
      mq?.removeEventListener?.('change', sync);
      observer.disconnect();
    };
  }, []);

  const animate = enabled && motionOk;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext?.('2d');
    if (!ctx) return undefined;

    let nodes = [];
    let raf = 0;
    let resizeTimer = 0;

    // Size the backing store for the device pixel ratio (capped at 2) but keep
    // every drawing coordinate in CSS pixels.
    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initNodes = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const n = Math.max(MIN_NODES, Math.min(MAX_NODES, Math.round((w * h) / AREA_PER_NODE)));
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1.2 + Math.random() * 1.6,
      }));
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const [ar, ag, ab] = accentRef.current;
      ctx.clearRect(0, 0, w, h);

      for (const p of nodes) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      // O(n^2) over <= 85 nodes — cheap enough that spatial hashing is not worth it.
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d >= LINK_DIST) continue;
          ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(1 - d / LINK_DIST) * LINK_ALPHA})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = NODE_FILL;
      for (const p of nodes) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sizeCanvas();
        initNodes();
      }, RESIZE_DEBOUNCE);
    };

    sizeCanvas();
    initNodes();
    window.addEventListener('resize', onResize);

    if (animate) {
      const loop = () => {
        draw();
        raf = requestAnimationFrame(loop);
      };
      loop();
    } else {
      // Disabled at runtime (low-power mode, reduced motion): leave the canvas
      // genuinely blank rather than frozen on the last painted frame.
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(raf);
    };
  }, [animate]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
