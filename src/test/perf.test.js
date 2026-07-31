import { describe, it, expect, beforeEach } from 'vitest';
import { getPerf, setPerf, applyStoredPerf } from '../theme/perf';

describe('perf mode', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.perf;
  });

  it('defaults to normal', () => {
    expect(getPerf()).toBe('normal');
  });

  it('setPerf writes the dataset and persists', () => {
    setPerf('low');
    expect(document.documentElement.dataset.perf).toBe('low');
    expect(getPerf()).toBe('low');
  });

  it('normalizes unknown values to normal', () => {
    expect(setPerf('turbo')).toBe('normal');
    expect(document.documentElement.dataset.perf).toBe('normal');
  });

  it('applyStoredPerf reflects the stored value', () => {
    setPerf('low');
    delete document.documentElement.dataset.perf;
    applyStoredPerf();
    expect(document.documentElement.dataset.perf).toBe('low');
  });
});
