import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import Launcher from '../shell/Launcher';

const open = (props = {}) =>
  render(<Launcher isOpen onLaunch={() => {}} onClose={() => {}} {...props} />);

describe('Launcher accessibility', () => {
  it('exposes the input as a combobox controlling the results list', () => {
    open();
    const input = screen.getByLabelText('Search applications');
    expect(input).toHaveAttribute('role', 'combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', 'launcher-results');
    expect(screen.getByRole('listbox')).toHaveAttribute('id', 'launcher-results');
  });

  it('announces the highlighted option via aria-activedescendant', () => {
    open();
    const input = screen.getByLabelText('Search applications');
    const first = input.getAttribute('aria-activedescendant');
    expect(first).toMatch(/^launcher-opt-/);

    // The referenced element must exist and be the selected option.
    expect(document.getElementById(first)).toHaveAttribute('aria-selected', 'true');
  });

  it('moves aria-activedescendant with the arrow keys', () => {
    open();
    const input = screen.getByLabelText('Search applications');
    const before = input.getAttribute('aria-activedescendant');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const after = input.getAttribute('aria-activedescendant');
    expect(after).not.toBe(before);
    expect(document.getElementById(after)).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps exactly one option selected at a time', () => {
    open();
    fireEvent.keyDown(screen.getByLabelText('Search applications'), { key: 'ArrowDown' });
    const selected = screen.getAllByRole('option').filter((o) => o.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveLength(1);
  });

  it('closes on Escape even when focus is not in the input', () => {
    const onClose = vi.fn();
    open({ onClose });
    // Fire from the panel, simulating focus having moved into the list.
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('launches on Enter fired from the panel, not just the input', () => {
    const onLaunch = vi.fn();
    open({ onLaunch });
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter' });
    expect(onLaunch).toHaveBeenCalled();
  });

  it('drops aria-activedescendant when nothing matches', () => {
    open();
    const input = screen.getByLabelText('Search applications');
    fireEvent.change(input, { target: { value: 'zzzzzzz' } });
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(within(screen.getByRole('listbox')).getByText(/No matching applications/)).toBeInTheDocument();
  });
});
