import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Overview from '../shell/Overview';

describe('<Overview>', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<Overview open={false} count={3} onExit={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('reports the window count', () => {
    render(<Overview open count={4} onExit={() => {}} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('documents the keyboard controls', () => {
    render(<Overview open count={2} onExit={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: 'Window overview' });
    expect(dialog.textContent).toMatch(/select/);
    expect(dialog.textContent).toMatch(/focus/);
    expect(dialog.textContent).toMatch(/Esc/);
  });

  it('exits when the backdrop is clicked', () => {
    const onExit = vi.fn();
    render(<Overview open count={2} onExit={onExit} />);
    fireEvent.click(screen.getByRole('dialog', { name: 'Window overview' }));
    expect(onExit).toHaveBeenCalled();
  });

  it('does not throw without an onExit handler', () => {
    render(<Overview open count={1} />);
    expect(() => fireEvent.click(screen.getByRole('dialog'))).not.toThrow();
  });
});
