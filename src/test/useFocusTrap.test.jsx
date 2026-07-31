import { describe, it, expect } from 'vitest';
import { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useFocusTrap } from '../shell/useFocusTrap';

function Trapped({ active }) {
  const ref = useRef(null);
  useFocusTrap(active, ref);
  return (
    <div>
      <button>outside</button>
      <div ref={ref} tabIndex={-1}>
        <button>first</button>
        <button>last</button>
      </div>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('focuses the first focusable element when activated', () => {
    render(<Trapped active />);
    expect(document.activeElement).toBe(screen.getByText('first'));
  });

  it('wraps focus from the last element back to the first on Tab', () => {
    render(<Trapped active />);
    const last = screen.getByText('last');
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByText('first'));
  });

  it('wraps backwards from first to last on Shift+Tab', () => {
    render(<Trapped active />);
    const first = screen.getByText('first');
    first.focus();
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByText('last'));
  });
});
