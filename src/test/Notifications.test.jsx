import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Notifications from '../shell/Notifications';

const ITEMS = [
  { id: 1, title: 'Welcome', text: 'Logged in', icon: '🎉' },
  { id: 2, title: 'Theme changed', text: 'Gruvbox', icon: '🎨' },
];

describe('<Notifications>', () => {
  it('renders nothing when the queue is empty', () => {
    const { container } = render(<Notifications items={[]} onDismiss={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders each toast title and text', () => {
    render(<Notifications items={ITEMS} onDismiss={() => {}} />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Gruvbox')).toBeInTheDocument();
  });

  it('dismisses a toast on click', () => {
    const onDismiss = vi.fn();
    render(<Notifications items={ITEMS} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText('Welcome'));
    expect(onDismiss).toHaveBeenCalledWith(1);
  });

  it('exposes an aria-live region', () => {
    render(<Notifications items={ITEMS} onDismiss={() => {}} />);
    expect(screen.getByRole('region', { name: 'Notifications' })).toHaveAttribute('aria-live', 'polite');
  });
});
