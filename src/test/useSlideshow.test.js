import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlideshow } from '../shell/useSlideshow';

describe('useSlideshow', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('does nothing while disabled', () => {
    const cb = vi.fn();
    renderHook(() => useSlideshow(false, 1000, cb));
    act(() => vi.advanceTimersByTime(5000));
    expect(cb).not.toHaveBeenCalled();
  });

  it('fires on each interval while enabled', () => {
    const cb = vi.fn();
    renderHook(() => useSlideshow(true, 1000, cb));
    act(() => vi.advanceTimersByTime(3000));
    expect(cb).toHaveBeenCalledTimes(3);
  });

  it('stops when disabled', () => {
    const cb = vi.fn();
    const { rerender } = renderHook(({ on }) => useSlideshow(on, 1000, cb), { initialProps: { on: true } });
    act(() => vi.advanceTimersByTime(2000));
    rerender({ on: false });
    act(() => vi.advanceTimersByTime(5000));
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('always calls the latest callback without restarting the timer', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ fn }) => useSlideshow(true, 1000, fn), { initialProps: { fn: first } });
    act(() => vi.advanceTimersByTime(1000));
    rerender({ fn: second });
    act(() => vi.advanceTimersByTime(1000));
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('ignores a non-positive interval', () => {
    const cb = vi.fn();
    renderHook(() => useSlideshow(true, 0, cb));
    act(() => vi.advanceTimersByTime(5000));
    expect(cb).not.toHaveBeenCalled();
  });
});
