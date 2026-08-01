import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Dock from '../shell/Dock';
import EmptyHint from '../shell/EmptyHint';

const WINDOWS = [
  { id: 'w1', title: 'kitty', color: '#7aa2f7', focused: true },
  { id: 'w2', title: 'Files', color: '#e0af68' },
  { id: 'w3', title: 'Firefox', color: '#bb9af7', minimized: true },
];

describe('<Dock>', () => {
  it('renders nothing when no windows are open', () => {
    const { container } = render(<Dock windows={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the windows prop is omitted', () => {
    const { container } = render(<Dock />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders one pill per window, minimized ones included', () => {
    render(<Dock windows={WINDOWS} />);
    const dock = screen.getByRole('group', { name: 'Open windows' });

    expect(within(dock).getAllByRole('button')).toHaveLength(3);
    expect(within(dock).getByRole('button', { name: 'Focus kitty' })).toBeInTheDocument();
    expect(within(dock).getByRole('button', { name: 'Focus Files' })).toBeInTheDocument();
    expect(within(dock).getByRole('button', { name: 'Restore Firefox' })).toBeInTheDocument();
  });

  it('styles a minimized pill differently from an open one', () => {
    render(<Dock windows={WINDOWS} />);
    const open = screen.getByRole('button', { name: 'Focus Files' });
    const minimized = screen.getByRole('button', { name: 'Restore Firefox' });

    expect(minimized.className).toMatch(/minimized/);
    expect(minimized.className).not.toMatch(/active/);
    expect(open.className).toMatch(/active/);
    expect(open.className).not.toMatch(/minimized/);
    expect(minimized.className).not.toBe(open.className);
  });

  it('marks only the focused window with the focused style', () => {
    render(<Dock windows={WINDOWS} />);
    expect(screen.getByRole('button', { name: 'Focus kitty' }).className).toMatch(/focused/);
    expect(screen.getByRole('button', { name: 'Focus Files' }).className).not.toMatch(/focused/);
  });

  it('tracks focus with aria-pressed', () => {
    render(<Dock windows={WINDOWS} />);
    expect(screen.getByRole('button', { name: 'Focus kitty' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Focus Files' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Restore Firefox' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('moves aria-pressed when focus moves to another window', () => {
    const { rerender } = render(<Dock windows={WINDOWS} />);
    rerender(
      <Dock windows={WINDOWS.map((w) => ({ ...w, focused: w.id === 'w2' }))} />,
    );

    expect(screen.getByRole('button', { name: 'Focus kitty' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Focus Files' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('hands the window id back on click', () => {
    const onSelect = vi.fn();
    render(<Dock windows={WINDOWS} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Focus Files' }));
    expect(onSelect).toHaveBeenCalledWith('w2');
  });

  it('hands back the id of a minimized window too', () => {
    const onSelect = vi.fn();
    render(<Dock windows={WINDOWS} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Restore Firefox' }));
    expect(onSelect).toHaveBeenCalledWith('w3');
  });

  it('survives a click with no onSelect handler', () => {
    render(<Dock windows={WINDOWS} />);
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Focus kitty' }))).not.toThrow();
  });

  it('tints each pill dot with the window colour', () => {
    render(<Dock windows={WINDOWS} />);
    const pill = screen.getByRole('button', { name: 'Focus kitty' });
    const dot = pill.querySelector('[aria-hidden="true"]');
    expect(dot.style.background).toBe('rgb(122, 162, 247)');
  });
});

describe('<EmptyHint>', () => {
  it('renders nothing while hidden', () => {
    const { container } = render(<EmptyHint visible={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when visible is omitted', () => {
    const { container } = render(<EmptyHint />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the keybinding crib sheet when visible', () => {
    render(<EmptyHint visible />);
    const note = screen.getByRole('note');

    expect(within(note).getByText('ctrl+q')).toBeInTheDocument();
    expect(note).toHaveTextContent(/ctrl\+q\s*terminal/);
  });

  it('keeps the separators out of the accessibility tree', () => {
    render(<EmptyHint visible />);
    const seps = screen.getByRole('note').querySelectorAll('[aria-hidden="true"]');
    expect(seps.length).toBeGreaterThan(0);
  });
});
