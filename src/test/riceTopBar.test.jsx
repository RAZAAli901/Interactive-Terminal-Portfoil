import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import TopBar from '../shell/TopBar';

/** Distinct values per pill so `getByText` can never match the wrong one. */
const STATS = { cpu: 42, ram: 71, temp: 55, net: '1.2M', volume: 30, battery: 88 };

describe('<TopBar> workspaces', () => {
  it('renders one tab per workspace inside a labelled tablist', () => {
    render(<TopBar />);
    const list = screen.getByRole('tablist', { name: 'Workspaces' });
    expect(within(list).getAllByRole('tab')).toHaveLength(5);
    expect(within(list).getByRole('tab', { name: 'Workspace 4' })).toBeInTheDocument();
  });

  it('marks exactly the active workspace as selected', () => {
    render(<TopBar activeWorkspace={3} />);
    const selected = screen.getAllByRole('tab', { selected: true });
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveAccessibleName('Workspace 3');
  });

  it('moves aria-selected when the active workspace changes', () => {
    const { rerender } = render(<TopBar activeWorkspace={1} />);
    expect(screen.getByRole('tab', { name: 'Workspace 1' })).toHaveAttribute('aria-selected', 'true');

    rerender(<TopBar activeWorkspace={5} />);
    expect(screen.getByRole('tab', { name: 'Workspace 1' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'Workspace 5' })).toHaveAttribute('aria-selected', 'true');
  });

  it('reports the clicked workspace number', () => {
    const onWorkspace = vi.fn();
    render(<TopBar activeWorkspace={1} onWorkspace={onWorkspace} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Workspace 4' }));
    expect(onWorkspace).toHaveBeenCalledWith(4);
  });

  it('flags occupied workspaces without selecting them', () => {
    render(<TopBar activeWorkspace={1} occupied={new Set([2])} />);
    const ws2 = screen.getByRole('tab', { name: 'Workspace 2' });
    expect(ws2.className).toMatch(/occupied/);
    expect(ws2).toHaveAttribute('aria-selected', 'false');
  });
});

describe('<TopBar> workspace wheel', () => {
  const wheel = (deltaY) => {
    fireEvent.wheel(screen.getByRole('tablist', { name: 'Workspaces' }), { deltaY });
  };

  it('steps forward on a downward wheel', () => {
    const onWorkspace = vi.fn();
    render(<TopBar activeWorkspace={2} onWorkspace={onWorkspace} />);

    wheel(1);
    expect(onWorkspace).toHaveBeenCalledWith(3);
  });

  it('steps backward on an upward wheel', () => {
    const onWorkspace = vi.fn();
    render(<TopBar activeWorkspace={2} onWorkspace={onWorkspace} />);

    wheel(-1);
    expect(onWorkspace).toHaveBeenCalledWith(1);
  });

  it('does not fire a redundant update scrolling up from the first', () => {
    const onWorkspace = vi.fn();
    render(<TopBar activeWorkspace={1} onWorkspace={onWorkspace} />);

    wheel(-1);
    expect(onWorkspace).not.toHaveBeenCalled();
  });

  it('does not fire a redundant update scrolling down from the last', () => {
    const onWorkspace = vi.fn();
    render(<TopBar activeWorkspace={5} onWorkspace={onWorkspace} />);

    wheel(1);
    expect(onWorkspace).not.toHaveBeenCalled();
  });
});

describe('<TopBar> layout toggle', () => {
  it('reads "dwindle" and is pressed while tiling', () => {
    render(<TopBar layout="dwindle" />);
    const btn = screen.getByRole('button', { name: 'Toggle tiling layout' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn).toHaveTextContent('dwindle');
  });

  it('reads "floating" and is unpressed in float layout', () => {
    render(<TopBar layout="float" />);
    const btn = screen.getByRole('button', { name: 'Toggle tiling layout' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(btn).toHaveTextContent('floating');
  });

  it('calls onToggleLayout when clicked', () => {
    const onToggleLayout = vi.fn();
    render(<TopBar layout="dwindle" onToggleLayout={onToggleLayout} />);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle tiling layout' }));
    expect(onToggleLayout).toHaveBeenCalledTimes(1);
  });
});

describe('<TopBar> actions and title', () => {
  it('fires onOverview from the overview button', () => {
    const onOverview = vi.fn();
    render(<TopBar onOverview={onOverview} />);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle window overview' }));
    expect(onOverview).toHaveBeenCalledTimes(1);
  });

  it('fires onPower from the power button', () => {
    const onPower = vi.fn();
    render(<TopBar onPower={onPower} />);

    fireEvent.click(screen.getByRole('button', { name: 'Power menu' }));
    expect(onPower).toHaveBeenCalledTimes(1);
  });

  it('renders the focused window title', () => {
    render(<TopBar focusedTitle="kitty — ~/dev" />);
    expect(screen.getByText('kitty — ~/dev')).toBeInTheDocument();
  });

  it('omits the title element when nothing is focused', () => {
    const { container } = render(<TopBar focusedTitle="" />);
    const bar = within(container).getByRole('navigation', { name: 'Status bar' });
    expect(bar.querySelector('[class*="title"]')).toBeNull();
  });
});

describe('<TopBar> stat pills', () => {
  it('renders every value handed in via stats', () => {
    render(<TopBar stats={STATS} />);

    expect(within(screen.getByTitle('CPU load')).getByText('42%')).toBeInTheDocument();
    expect(within(screen.getByTitle('Memory usage')).getByText('71%')).toBeInTheDocument();
    expect(within(screen.getByTitle('CPU temperature')).getByText('55°C')).toBeInTheDocument();
    expect(within(screen.getByTitle('Network down')).getByText('1.2M')).toBeInTheDocument();
    expect(within(screen.getByTitle('Volume')).getByText('30%')).toBeInTheDocument();
    expect(within(screen.getByTitle('Battery')).getByText('88%')).toBeInTheDocument();
  });

  it('accepts the useSystemStats alias netDown for the network pill', () => {
    render(<TopBar stats={{ netDown: '840K' }} />);
    expect(within(screen.getByTitle('Network down')).getByText('840K')).toBeInTheDocument();
  });

  it('falls back to zeroes and a default volume for an empty stats object', () => {
    // An explicit empty object exercises the fallbacks; omitting the prop makes
    // the bar source its own live telemetry instead.
    render(<TopBar stats={{}} />);

    expect(within(screen.getByTitle('CPU load')).getByText('0%')).toBeInTheDocument();
    expect(within(screen.getByTitle('CPU temperature')).getByText('0°C')).toBeInTheDocument();
    expect(within(screen.getByTitle('Volume')).getByText('65%')).toBeInTheDocument();
  });

  it('sources its own telemetry when no stats prop is given', () => {
    render(<TopBar />);
    // Live values are randomised, so just assert the pills render a percentage.
    expect(within(screen.getByTitle('CPU load')).getByText(/^\d+%$/)).toBeInTheDocument();
    expect(within(screen.getByTitle('Memory usage')).getByText(/^\d+%$/)).toBeInTheDocument();
  });

  it('keeps screen-reader names on the glyph-only pills', () => {
    render(<TopBar stats={STATS} />);

    expect(within(screen.getByTitle('Network down')).getByText('Network down')).toBeInTheDocument();
    expect(within(screen.getByTitle('Volume')).getByText('Volume')).toBeInTheDocument();
    expect(within(screen.getByTitle('Battery')).getByText('Battery')).toBeInTheDocument();
  });
});
