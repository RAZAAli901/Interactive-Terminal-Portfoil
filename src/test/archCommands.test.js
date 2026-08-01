import { describe, it, expect } from 'vitest';
import { handleCommand } from '../utils/commandHandler';

const run = (input) => handleCommand(input, { isAdmin: false, currentPath: '/portfolio', history: [] });
const flat = (out) => (Array.isArray(out.content) ? out.content.join('\n') : String(out.content));

describe('Arch-flavoured terminal commands', () => {
  it('pacman -Q lists installed packages', () => {
    const text = flat(run('pacman -Q'));
    expect(text).toMatch(/hyprland/);
    expect(text).toMatch(/waybar/);
  });

  it('pacman -Syu reports the system is up to date', () => {
    expect(flat(run('pacman -Syu'))).toMatch(/nothing to do/i);
  });

  it('df -h shows the root filesystem', () => {
    const text = flat(run('df -h'));
    expect(text).toMatch(/nvme0n1p2/);
    expect(text).toMatch(/Mounted on/);
  });

  it('sensors reports temperatures', () => {
    expect(flat(run('sensors'))).toMatch(/°C/);
  });

  it('htop shows a process table', () => {
    const text = flat(run('htop'));
    expect(text).toMatch(/hyprland|kitty|firefox/i);
  });
});

describe('btop', () => {
  it('renders CPU, per-core and memory gauges', () => {
    const text = flat(run('btop'));
    expect(text).toMatch(/CPU/);
    expect(text).toMatch(/core0/);
    expect(text).toMatch(/RAM/);
    expect(text).toMatch(/SWP/);
  });

  it('draws proportional bars', () => {
    const text = flat(run('btop'));
    expect(text).toMatch(/█/);
    expect(text).toMatch(/░/);
  });

  it('points at htop for the process table', () => {
    expect(flat(run('btop'))).toMatch(/htop/);
  });
});
