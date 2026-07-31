import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSystemStats } from '../shell/useSystemStats';

afterEach(() => {
  vi.useRealTimers();
  delete document.documentElement.dataset.perf;
});

describe('useSystemStats', () => {
  it('exposes the expected metric keys', () => {
    const { result } = renderHook(() => useSystemStats());
    for (const key of ['cpu', 'ram', 'netDown', 'netUp', 'temp', 'volume', 'battery']) {
      expect(typeof result.current[key]).toBe('number');
    }
  });

  it('keeps CPU and RAM within sane bounds as it ticks', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useSystemStats(500));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.cpu).toBeGreaterThanOrEqual(0);
    expect(result.current.cpu).toBeLessThanOrEqual(100);
    expect(result.current.ram).toBeGreaterThanOrEqual(0);
    expect(result.current.ram).toBeLessThanOrEqual(100);
  });

  it('does not tick in low-power mode', () => {
    document.documentElement.dataset.perf = 'low';
    vi.useFakeTimers();
    const { result } = renderHook(() => useSystemStats(500));
    const before = result.current.cpu;
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.cpu).toBe(before);
  });
});
