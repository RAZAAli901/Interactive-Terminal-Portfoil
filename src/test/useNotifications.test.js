import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '../shell/useNotifications';

describe('useNotifications', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('adds a toast with a title/text/icon', () => {
    const { result } = renderHook(() => useNotifications(1000));
    act(() => result.current.notify('Hello', 'world', '👋'));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ title: 'Hello', text: 'world', icon: '👋' });
  });

  it('auto-dismisses after the ttl', () => {
    const { result } = renderHook(() => useNotifications(1000));
    act(() => result.current.notify('bye'));
    expect(result.current.items).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.items).toHaveLength(0);
  });

  it('dismiss removes a specific toast by id', () => {
    const { result } = renderHook(() => useNotifications(9999));
    act(() => result.current.notify('a'));
    act(() => result.current.notify('b'));
    const firstId = result.current.items[0].id;
    act(() => result.current.dismiss(firstId));
    expect(result.current.items.map((n) => n.title)).toEqual(['b']);
  });

  it('assigns unique incrementing ids', () => {
    const { result } = renderHook(() => useNotifications(9999));
    act(() => result.current.notify('a'));
    act(() => result.current.notify('b'));
    const [a, b] = result.current.items;
    expect(a.id).not.toBe(b.id);
  });
});
