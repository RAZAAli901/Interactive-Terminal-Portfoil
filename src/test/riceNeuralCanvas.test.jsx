import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import NeuralCanvas from '../shell/NeuralCanvas';

/**
 * jsdom ships no 2D context, so every drawing call would explode. Stub the
 * prototype with a recording no-op context. Kept local to this file.
 */
function makeCtx() {
  return {
    // mutable style state the component assigns to
    lineWidth: 1,
    strokeStyle: '',
    fillStyle: '',
    // drawing surface
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
  };
}

let ctx;
let getContext;

beforeEach(() => {
  ctx = makeCtx();
  getContext = vi.fn(() => ctx);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(getContext);
});

afterEach(() => {
  vi.restoreAllMocks();
  delete document.documentElement.dataset.perf;
});

/** The single canvas the component owns. */
function canvasIn(container) {
  return container.querySelector('canvas');
}

describe('<NeuralCanvas>', () => {
  it('renders a decorative canvas and asks for a 2d context', () => {
    const { container } = render(<NeuralCanvas />);
    const canvas = canvasIn(container);
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(getContext).toHaveBeenCalledWith('2d');
  });

  it('sizes the backing store for the device pixel ratio', () => {
    const { container } = render(<NeuralCanvas />);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    expect(canvasIn(container).width).toBe(Math.round(window.innerWidth * dpr));
    expect(canvasIn(container).height).toBe(Math.round(window.innerHeight * dpr));
    expect(ctx.setTransform).toHaveBeenCalledWith(dpr, 0, 0, dpr, 0, 0);
  });

  it('draws at least one frame when enabled', () => {
    render(<NeuralCanvas />);
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
  });

  it('strokes links with the supplied accent', () => {
    // Pin every Math.random() so all nodes stack on one point: distance 0 means
    // every pair links at full alpha, making the stroke colour deterministic.
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    render(<NeuralCanvas accent="#bb9af7" />);
    // #bb9af7 -> rgb(187,154,247); alpha is (1 - 0/158) * 0.26.
    expect(ctx.strokeStyle).toBe('rgba(187,154,247,0.26)');
  });

  it('falls back to the default accent when the hex is unparseable', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    render(<NeuralCanvas accent="not-a-colour" />);
    // FALLBACK_ACCENT is #7aa2f7 -> rgb(122,162,247).
    expect(ctx.strokeStyle).toBe('rgba(122,162,247,0.26)');
  });

  it('renders a blank canvas without throwing when enabled={false}', () => {
    let container;
    expect(() => {
      ({ container } = render(<NeuralCanvas enabled={false} />));
    }).not.toThrow();
    expect(canvasIn(container)).toBeInTheDocument();
    // The canvas is still sized, and it is explicitly cleared so nothing is
    // left frozen on screen — but no nodes or links are ever painted.
    expect(ctx.setTransform).toHaveBeenCalled();
    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
    expect(ctx.stroke).not.toHaveBeenCalled();
    expect(ctx.arc).not.toHaveBeenCalled();
    expect(ctx.fill).not.toHaveBeenCalled();
  });

  it('does not throw and stays still when :root[data-perf="low"] is set', () => {
    document.documentElement.dataset.perf = 'low';
    let container;
    expect(() => {
      ({ container } = render(<NeuralCanvas />));
    }).not.toThrow();
    expect(canvasIn(container)).toBeInTheDocument();
    // Cleared once, then nothing painted.
    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
    expect(ctx.stroke).not.toHaveBeenCalled();
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it('cancels its rAF loop on unmount', () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');

    const { unmount } = render(<NeuralCanvas />);
    expect(rafSpy).toHaveBeenCalled();

    expect(() => unmount()).not.toThrow();
    expect(cancelSpy).toHaveBeenCalled();

    // The handle it cancels must be one the loop actually scheduled, not a stale 0.
    const scheduled = rafSpy.mock.results.map((r) => r.value);
    const cancelled = cancelSpy.mock.calls.map(([handle]) => handle);
    expect(cancelled.some((handle) => scheduled.includes(handle))).toBe(true);
  });

  it('unmounts cleanly when it never started a loop', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = render(<NeuralCanvas enabled={false} />);
    expect(() => unmount()).not.toThrow();
    expect(cancelSpy).toHaveBeenCalledWith(0);
  });

  it('detaches its resize listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<NeuralCanvas />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
