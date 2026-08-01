import { describe, it, expect } from 'vitest';
import { handleCommand } from '../utils/commandHandler';
import { fsData } from '../utils/fileSystem';

const run = (input, path = '/portfolio') =>
  handleCommand(input, { isAdmin: false, currentPath: path, history: [] });
const flat = (out) => (Array.isArray(out.content) ? out.content.join('\n') : String(out.content));

describe('rice dotfiles in the simulated filesystem', () => {
  it('registers the hypr and waybar config directories', () => {
    expect(fsData['/.config/hypr']).toBeDefined();
    expect(fsData['/.config/waybar']).toBeDefined();
  });

  it('every directory child resolves to a real entry', () => {
    for (const [path, node] of Object.entries(fsData)) {
      if (node.type !== 'dir') continue;
      for (const child of node.children) {
        const childPath = path === '/' ? `/${child}` : `${path}/${child}`;
        expect(fsData[childPath], `dangling child ${childPath}`).toBeDefined();
      }
    }
  });

  it('cat prints the hyprland config with the real tiling settings', () => {
    const text = flat(run('cat /.config/hypr/hyprland.conf'));
    expect(text).toMatch(/layout = dwindle/);
    expect(text).toMatch(/gaps_in = 8/);
    expect(text).toMatch(/rounding = 11/);
  });

  it('the hyprland config documents the keybindings the desktop implements', () => {
    const text = flat(run('cat /.config/hypr/hyprland.conf'));
    expect(text).toMatch(/\$mod, D, exec, wofi/);
    expect(text).toMatch(/hyprexpo/);
  });

  it('cat prints the waybar config with the real module layout', () => {
    const text = flat(run('cat /.config/waybar/config.jsonc'));
    expect(text).toMatch(/hyprland\/workspaces/);
    expect(text).toMatch(/"height": 40/);
  });

  it('ls lists the hypr config directory', () => {
    expect(flat(run('ls /.config/hypr'))).toMatch(/hyprland\.conf/);
  });
});
