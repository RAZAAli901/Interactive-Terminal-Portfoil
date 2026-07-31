import { describe, it, expect } from 'vitest';
import { handleCommand } from '../utils/commandHandler';

const run = (input) => handleCommand(input, { isAdmin: false, currentPath: '/portfolio', history: [] });
const flat = (out) => (Array.isArray(out.content) ? out.content.join('\n') : String(out.content));

describe('network / systemd terminal commands', () => {
  it('ip a lists interfaces and an IPv4 address', () => {
    const text = flat(run('ip a'));
    expect(text).toMatch(/wlan0/);
    expect(text).toMatch(/192\.168\.1\.\d+/);
  });

  it('systemctl status reports a running system', () => {
    expect(flat(run('systemctl status'))).toMatch(/running/);
  });

  it('cava renders visualiser bars', () => {
    expect(flat(run('cava'))).toMatch(/[▁▂▃▄▅▆▇█]/);
  });
});
