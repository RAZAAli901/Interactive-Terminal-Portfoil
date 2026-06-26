import { formatTable, formatSuccess, formatError, formatInfo, formatWarning, formatSection } from './terminalFormatting';
import { getFuzzyMatches } from './fuzzyMatch';
import { getHistory } from './localStorage';

// Will hold the full commands registry
export const commands = [
  {
    name: 'help',
    description: 'Display help information for all commands or a specific command',
    usage: 'help [command_name]',
    examples: ['help', 'help projects'],
    handler: (args) => {
      const target = args[0];
      if (!target) {
        // List all commands in 3 columns (NAME | DESCRIPTION | USAGE)
        const headers = ['NAME', 'DESCRIPTION', 'USAGE'];
        // Sort commands alphabetically
        const rows = commands
          .map(cmd => [cmd.name, cmd.description, cmd.usage])
          .sort((a, b) => a[0].localeCompare(b[0]));
        
        const tableLines = formatTable(headers, rows);
        
        return {
          type: 'text',
          content: [
            ...formatSection('AVAILABLE COMMANDS'),
            ...tableLines,
            '',
            formatInfo("Type 'help COMMAND' for detailed info")
          ]
        };
      } else {
        // Detailed info for a specific command
        const cmd = commands.find(c => c.name === target.toLowerCase());
        if (!cmd) {
          return {
            type: 'text',
            content: [formatError(`Command '${target}' not found. Type 'help' to see all commands.`)]
          };
        }
        
        return {
          type: 'text',
          content: [
            ...formatSection(`HELP: ${cmd.name.toUpperCase()}`),
            `Description : ${cmd.description}`,
            `Usage       : ${cmd.usage}`,
            `Examples    : ${cmd.examples.join(' or ')}`,
            ''
          ]
        };
      }
    }
  },
  {
    name: 'history',
    description: 'Display recently typed commands',
    usage: 'history [--limit N]',
    examples: ['history', 'history --limit 15'],
    handler: (args) => {
      let limit = 20;
      const limitIdx = args.indexOf('--limit');
      if (limitIdx !== -1 && args[limitIdx + 1]) {
        const parsed = parseInt(args[limitIdx + 1], 10);
        if (!isNaN(parsed)) limit = parsed;
      }
      
      const historyList = getHistory();
      if (historyList.length === 0) {
        return {
          type: 'text',
          content: [formatInfo('No command history found.')]
        };
      }
      
      const displayed = historyList.slice(-limit);
      const outputLines = displayed.map((cmd, i) => {
        const index = (historyList.length - displayed.length + i + 1).toString().padStart(3, ' ');
        return `  ${index}  ${cmd}`;
      });
      
      return {
        type: 'text',
        content: [
          ...formatSection('COMMAND HISTORY'),
          ...outputLines,
          '',
          formatInfo(`Showing last ${displayed.length} commands. Total stored: ${historyList.length}`)
        ]
      };
    }
  }
];

/**
 * Main command dispatcher
 * @param {string} rawInput 
 * @param {object} context - Admin states, history, wallpaper methods
 * @returns {object} Output definition for Terminal renderer
 */
export function handleCommand(rawInput, context = {}) {
  const trimmed = rawInput.trim();
  if (trimmed === '') {
    return { type: 'text', content: [] };
  }

  // Parse arguments, respect quotes for phrases later if needed
  const args = trimmed.split(/\s+/);
  const cmdName = args[0].toLowerCase();
  const cmdArgs = args.slice(1);

  // Look up command in registry
  const cmd = commands.find(c => c.name === cmdName);
  
  if (cmd) {
    try {
      return cmd.handler(cmdArgs, context);
    } catch (e) {
      return {
        type: 'text',
        content: [formatError(`Error executing command '${cmdName}': ${e.message}`)]
      };
    }
  }

  // Fuzzy match suggestion for invalid commands
  const allNames = commands.map(c => c.name);
  const closest = getFuzzyMatches(cmdName, allNames, 3);
  
  const suggestions = closest.map(s => `  • ${s}`).join('\n');
  
  return {
    type: 'text',
    content: [
      formatError(`Command '${cmdName}' not found. Did you mean:`),
      suggestions,
      '',
      formatInfo("Type 'help' to see all commands")
    ]
  };
}
