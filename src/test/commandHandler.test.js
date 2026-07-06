import { describe, it, expect } from 'vitest';
import { handleCommand } from '../utils/commandHandler';

describe('commandHandler', () => {
  it('returns empty content for empty input', () => {
    const result = handleCommand('   ');
    expect(result.type).toBe('text');
    expect(result.content).toEqual([]);
  });

  it('handles known commands like help', () => {
    const result = handleCommand('help');
    expect(result.type).toBe('text');
    // It should contain the help header or section
    expect(result.content.some(line => line.includes('AVAILABLE COMMANDS') || line.includes('System Commands'))).toBe(true);
  });

  it('provides fuzzy suggestions for unknown commands', () => {
    const result = handleCommand('halp');
    expect(result.type).toBe('text');
    expect(result.content.some(line => line.includes("Command 'halp' not found"))).toBe(true);
    expect(result.content.some(line => line.includes('help'))).toBe(true);
  });

  it('trims whitespace and ignores case for command names', () => {
    const result = handleCommand('   HeLp   ');
    expect(result.type).toBe('text');
    expect(result.content.some(line => line.includes('AVAILABLE COMMANDS') || line.includes('System Commands'))).toBe(true);
  });

  it('executes easter eggs directly', () => {
    // Assuming 'sudo' or 'matrix' is an easter egg
    const result = handleCommand('sudo');
    expect(result.type).toBe('text');
    expect(result.content.length).toBeGreaterThan(0);
  });
});
