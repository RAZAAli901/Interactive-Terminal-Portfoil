import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MobileBar from '../shell/MobileBar';

describe('<MobileBar>', () => {
  it('shows the user@host and a clock', () => {
    render(<MobileBar />);
    expect(screen.getByText('raza@arch')).toBeInTheDocument();
    expect(screen.getByText(/^\d{2}:\d{2}$/)).toBeInTheDocument();
  });
});
