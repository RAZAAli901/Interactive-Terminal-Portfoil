import { describe, it, expect } from 'vitest';
import { handleCommand } from '../utils/commandHandler';

const run = (input) => handleCommand(input, { isAdmin: false, currentPath: '/portfolio', history: [] });
const flat = (out) => (Array.isArray(out.content) ? out.content.join('\n') : String(out.content));

describe('system / Hyprland terminal commands', () => {
  it('fastfetch shows the Arch + Hyprland profile card', () => {
    const text = flat(run('fastfetch'));
    expect(text).toMatch(/Arch Linux/);
    expect(text).toMatch(/Hyprland/);
  });

  it('neofetch is an alias for fastfetch', () => {
    expect(flat(run('neofetch'))).toMatch(/Arch Linux/);
  });

  it('hyprctl version reports Hyprland', () => {
    expect(flat(run('hyprctl version'))).toMatch(/Hyprland/);
  });

  it('hyprctl monitors lists a monitor', () => {
    expect(flat(run('hyprctl monitors'))).toMatch(/DP-1/);
  });

  it('uname -a includes the kernel and arch', () => {
    const text = flat(run('uname -a'));
    expect(text).toMatch(/Linux/);
    expect(text).toMatch(/x86_64/);
  });

  it('whoami prints the user', () => {
    expect(flat(run('whoami'))).toMatch(/razaali/);
  });

  it('uptime reports a load average', () => {
    expect(flat(run('uptime'))).toMatch(/load average/);
  });

  it('free shows memory rows', () => {
    expect(flat(run('free'))).toMatch(/Mem:/);
  });

  it('theme switches to a Hyprland palette', () => {
    const out = run('theme tokyo-night');
    expect(out.action).toBe('theme');
    expect(out.theme).toBe('tokyo-night');
  });

  it('theme accepts friendly aliases', () => {
    expect(run('theme mocha').theme).toBe('catppuccin-mocha');
  });
});
