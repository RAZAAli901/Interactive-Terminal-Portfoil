import { formatTable, formatSuccess, formatError, formatInfo, formatWarning, formatSection } from './terminalFormatting';
import { getFuzzyMatches } from './fuzzyMatch';
import { getHistory } from './localStorage';
import portfolioData from '../data/portfolio.json';

// Helper handlers to reuse between aliases
const resumeHandler = () => {
  const { name, title, location, email, github, linkedin } = portfolioData.bio;
  
  // Format skills string
  const skillsLines = Object.entries(portfolioData.skills).map(([cat, list]) => {
    const catName = cat.replace('_', '/').toUpperCase();
    const items = list.map(s => s.name).join(', ');
    return `  • ${catName.padEnd(12)}: ${items}`;
  });

  // Format experience list
  const expLines = portfolioData.experience.map(job => 
    `  • ${job.role} at ${job.company} (${job.period})`
  );

  return {
    type: 'text',
    content: [
      ...formatSection('RESUME / CV'),
      formatSuccess(`<strong>${name.toUpperCase()}</strong> | ${title}`),
      `Location     : ${location}`,
      `Email        : ${email}`,
      `LinkedIn     : ${linkedin}`,
      `GitHub       : ${github}`,
      '',
      formatWarning('--- SKILLS SUMMARY ---'),
      ...skillsLines,
      '',
      formatWarning('--- WORK HISTORY SUMMARY ---'),
      ...expLines,
      '',
      formatWarning('--- EDUCATION ---'),
      `  • ${portfolioData.education.degree} (${portfolioData.education.gradYear}) - ${portfolioData.education.institution} (GPA: ${portfolioData.education.gpa})`,
      '',
      formatInfo("Download full resume: 'download resume.pdf'")
    ]
  };
};

const experienceHandler = () => {
  const lines = [...formatSection('WORK EXPERIENCE')];
  portfolioData.experience.forEach((job, idx) => {
    lines.push(formatSuccess(`• ${job.role} @ ${job.company}`));
    lines.push(`  Period : ${job.period}`);
    job.details.forEach(detail => {
      lines.push(`  - ${detail}`);
    });
    if (idx < portfolioData.experience.length - 1) {
      lines.push('-----------------------------------------------------------');
    }
  });
  return { type: 'text', content: lines };
};

const educationHandler = () => {
  const edu = portfolioData.education;
  return {
    type: 'text',
    content: [
      ...formatSection('EDUCATION & CREDENTIALS'),
      formatSuccess(`• ${edu.degree}`),
      `  Institution : ${edu.institution}`,
      `  Graduation  : ${edu.gradYear}`,
      `  GPA         : ${edu.gpa}`,
      '',
      formatWarning('Relevant Coursework:'),
      `  ${edu.coursework.join(', ')}`,
      '',
      formatWarning('Certifications:'),
      ...edu.certifications.map(c => `  - ${c}`)
    ]
  };
};

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
  },
  {
    name: 'resume',
    description: 'Display my resume/CV formatted in terminal',
    usage: 'resume',
    examples: ['resume'],
    handler: resumeHandler
  },
  {
    name: 'cv',
    description: 'Alias for resume',
    usage: 'cv',
    examples: ['cv'],
    handler: resumeHandler
  },
  {
    name: 'experience',
    description: 'Show detailed work history in reverse chronological order',
    usage: 'experience',
    examples: ['experience'],
    handler: experienceHandler
  },
  {
    name: 'exp',
    description: 'Alias for experience',
    usage: 'exp',
    examples: ['exp'],
    handler: experienceHandler
  },
  {
    name: 'education',
    description: 'Display education background, courses and credentials',
    usage: 'education',
    examples: ['education'],
    handler: educationHandler
  },
  {
    name: 'edu',
    description: 'Alias for education',
    usage: 'edu',
    examples: ['edu'],
    handler: educationHandler
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
