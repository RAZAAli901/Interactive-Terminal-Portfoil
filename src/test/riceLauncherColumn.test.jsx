import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import LauncherColumn from '../shell/LauncherColumn';

/** label -> app id, in the order the column renders them. */
const ENTRIES = [
  ['kitty', 'terminal'],
  ['Files', 'files'],
  ['Firefox', 'browser'],
  ['Code', 'code'],
  ['about.md', 'about'],
  ['projects', 'projects'],
];

/** The launcher column, scoped so stray buttons elsewhere can never satisfy a query. */
function renderColumn(onLaunch = vi.fn()) {
  render(<LauncherColumn onLaunch={onLaunch} />);
  return {
    onLaunch,
    column: within(screen.getByRole('group', { name: 'Desktop launcher' })),
  };
}

describe('<LauncherColumn>', () => {
  it('renders exactly six launcher buttons', () => {
    const { column } = renderColumn();
    expect(column.getAllByRole('button')).toHaveLength(6);
  });

  it('labels every button "Launch <label>" in design order', () => {
    const { column } = renderColumn();
    const names = column.getAllByRole('button').map((b) => b.getAttribute('aria-label'));
    expect(names).toEqual(ENTRIES.map(([label]) => `Launch ${label}`));
  });

  it('shows the visible caption for each entry', () => {
    const { column } = renderColumn();
    for (const [label] of ENTRIES) {
      // The glyph tile is aria-hidden, so the caption is the button's only text node.
      expect(within(column.getByRole('button', { name: `Launch ${label}` })).getByText(label))
        .toBeInTheDocument();
    }
  });

  it.each(ENTRIES)('a single click on %s launches "%s"', (label, app) => {
    const { column, onLaunch } = renderColumn();
    fireEvent.click(column.getByRole('button', { name: `Launch ${label}` }));
    expect(onLaunch).toHaveBeenCalledTimes(1);
    expect(onLaunch).toHaveBeenCalledWith(app);
  });

  it('launches once per click — no double-click gate', () => {
    const { column, onLaunch } = renderColumn();
    const kitty = column.getByRole('button', { name: 'Launch kitty' });
    fireEvent.click(kitty);
    fireEvent.click(kitty);
    expect(onLaunch).toHaveBeenCalledTimes(2);
    expect(onLaunch).toHaveBeenNthCalledWith(2, 'terminal');
  });

  it('does not throw when onLaunch is omitted', () => {
    render(<LauncherColumn />);
    const kitty = screen.getByRole('button', { name: 'Launch kitty' });
    expect(() => fireEvent.click(kitty)).not.toThrow();
  });

  it('renders buttons as type="button" so a wrapping form is never submitted', () => {
    const { column } = renderColumn();
    for (const button of column.getAllByRole('button')) {
      expect(button).toHaveAttribute('type', 'button');
    }
  });
});
