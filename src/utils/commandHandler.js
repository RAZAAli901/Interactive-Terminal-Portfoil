import { formatTable, formatSuccess, formatError, formatInfo, formatWarning, formatSection } from './terminalFormatting';
import { getFuzzyMatches } from './fuzzyMatch';
import { getHistory } from './localStorage';
import portfolioData from '../data/portfolio.json';
import { funFacts } from '../data/funFacts';
import { resolveAbsolutePath, getFsItem } from './fileSystem';

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

const skillsHandler = (args) => {
  const isDetailed = args.includes('--detailed');
  const lines = [...formatSection('TECHNICAL SKILLS & STACK')];
  
  Object.entries(portfolioData.skills).forEach(([category, list]) => {
    const catName = category.replace('_', '/').toUpperCase();
    lines.push(formatWarning(`[ ${catName} ]`));
    
    list.forEach(skill => {
      const namePart = skill.name.padEnd(15, ' ');
      const barWidth = 15;
      const filled = Math.round((skill.level / 100) * barWidth);
      const bar = '▓'.repeat(filled) + '░'.repeat(barWidth - filled);
      
      let line = `  ${namePart} [${bar}] ${skill.level}%`;
      if (isDetailed && skill.project) {
        line += ` (Project: ${skill.project})`;
      }
      lines.push(line);
    });
    lines.push('');
  });
  
  if (!isDetailed) {
    lines.push(formatInfo("Tip: Type 'skills --detailed' to see associated projects for key skills."));
  }
  
  return { type: 'text', content: lines };
};

const techHandler = () => {
  return {
    type: 'text',
    content: [
      ...formatSection('CURRENT TECH STACK DETAILS'),
      `• ${formatInfo('Frontend')}: React 19, Vite, CSS Modules`,
      `• ${formatInfo('Backend ')}: Node.js, Express, LangChain`,
      `• ${formatInfo('Data    ')}: FAISS, Vector Embeddings, RAG`,
      `• ${formatInfo('Vision  ')}: YOLO, OpenCV, Python`,
      '',
      formatSuccess(`Current focus: ${portfolioData.bio.currentFocus}`),
      ''
    ]
  };
};

const projectsHandler = (args) => {
  let filtered = [...portfolioData.projects];

  // Category filters
  if (args.includes('--ml')) {
    filtered = filtered.filter(p => p.category === 'ml');
  }
  if (args.includes('--web')) {
    filtered = filtered.filter(p => p.category === 'web');
  }
  if (args.includes('--cpp')) {
    filtered = filtered.filter(p => p.category === 'cpp');
  }
  if (args.includes('--featured')) {
    filtered = filtered.filter(p => p.featured);
  }

  // Sort logic
  const sortIdx = args.indexOf('--sort');
  if (sortIdx !== -1 && args[sortIdx + 1]) {
    const sortBy = args[sortIdx + 1].toLowerCase();
    if (sortBy === 'date') {
      filtered.sort((a, b) => b.date.localeCompare(a.date));
    } else if (sortBy === 'stars') {
      filtered.sort((a, b) => b.stars - a.stars);
    } else if (sortBy === 'tech') {
      filtered.sort((a, b) => a.tech.localeCompare(b.tech));
    }
  }

  const headers = ['NAME', 'TECH', 'STATUS', 'DESCRIPTION'];
  const rows = filtered.map(p => [
    formatSuccess(p.name),
    formatInfo(p.tech),
    p.status,
    p.description
  ]);

  const tableLines = formatTable(headers, rows);

  return {
    type: 'text',
    content: [
      ...formatSection('PROJECTS & PORTFOLIO'),
      ...tableLines,
      '',
      formatInfo("Usage: projects [--ml|--web|--cpp|--featured] [--sort DATE|STARS|TECH]"),
      formatInfo("To inspect a project: open-project [name]")
    ]
  };
};

const openProjectHandler = (args) => {
  const queryName = args.join(' ');
  if (!queryName) {
    return {
      type: 'text',
      content: [formatError("Usage: open-project [project-name]")]
    };
  }

  const proj = portfolioData.projects.find(p => 
    p.name.toLowerCase() === queryName.toLowerCase() || 
    p.id.toLowerCase() === queryName.toLowerCase()
  );

  if (!proj) {
    return {
      type: 'text',
      content: [
        formatError(`Project '${queryName}' not found.`),
        formatInfo("Type 'projects' to view the full list.")
      ]
    };
  }

  const liveLink = formatLink('Live Link', proj.liveUrl);
  const repoLink = formatLink('GitHub Link', proj.repoUrl);

  return {
    type: 'text',
    content: [
      ...formatSection(`PROJECT: ${proj.name.toUpperCase()}`),
      `Description   : ${proj.longDescription}`,
      `Links         : ${liveLink}  |  ${repoLink}`,
      `Tech Stack    : ${proj.tech}`,
      `Key Features  :`,
      ...proj.features.map(f => `  • ${f}`),
      `Stats         : ⭐ ${proj.stars} stars | 🍴 ${proj.forks} forks | 📅 Last Updated: ${proj.lastUpdated}`,
      `Related Skills: ${proj.relatedSkills.join(', ')}`,
      ''
    ]
  };
};

const contactHandler = (args) => {
  if (args.includes('--send')) {
    return {
      type: 'action',
      action: 'contact-send'
    };
  }
  
  const { email, linkedin, github, twitter, location, timezone } = portfolioData.bio;
  // Mask email: razaalymurtaza@gmail.com -> r***a@gmail.com
  const maskedEmail = email.replace(/^(.)(.*)(.@.*)$/, (_, first, middle, last) => {
    return `${first}${'*'.repeat(middle.length)}${last}`;
  });
  
  return {
    type: 'text',
    content: [
      ...formatSection('CONTACT INFORMATION'),
      `• Email    : ${maskedEmail} (use 'contact --send' to send a message)`,
      `• LinkedIn : ${linkedin}`,
      `• GitHub   : ${github}`,
      `• Twitter  : ${twitter}`,
      `• Location : ${location}`,
      `• Timezone : ${timezone}`,
      '',
      formatInfo("To send an email directly, type: 'contact --send'")
    ]
  };
};

const hireMeHandler = () => {
  const { availability, rate, responseTime, relocation } = portfolioData.bio;
  return {
    type: 'text',
    content: [
      ...formatSection('HIRING STATUS & AVAILABILITY'),
      `• Status       : ${formatSuccess(availability)}`,
      `• Hourly Rate  : ${rate}`,
      `• Response Time: ${responseTime}`,
      `• Relocation   : ${relocation}`,
      `• Best Reach   : run 'contact --send'`,
      '',
      formatSuccess("Open for contract, full-time AI/ML, and full-stack opportunities.")
    ]
  };
};

const connectHandler = (args) => {
  const platform = args[0] ? args[0].toLowerCase() : null;
  const { linkedin, github, twitter, email } = portfolioData.bio;
  
  if (!platform) {
    return {
      type: 'text',
      content: [
        formatWarning("Usage: connect [linkedin|github|twitter|email]"),
        '',
        "Available platforms:",
        `  • linkedin  : ${linkedin}`,
        `  • github    : ${github}`,
        `  • twitter   : ${twitter}`,
        `  • email     : Send a message`
      ]
    };
  }
  
  if (platform === 'linkedin') {
    return {
      type: 'text',
      content: [
        formatSuccess("LinkedIn Profile:"),
        formatLink("Raza Ali Murtaza on LinkedIn", `https://${linkedin}`)
      ]
    };
  } else if (platform === 'github') {
    return {
      type: 'text',
      content: [
        formatSuccess("GitHub Profile:"),
        formatLink("Raza Ali Murtaza on GitHub", `https://${github}`)
      ]
    };
  } else if (platform === 'twitter' || platform === 'x') {
    return {
      type: 'text',
      content: [
        formatSuccess("Twitter Profile:"),
        formatLink("Raza Ali Murtaza on Twitter", `https://twitter.com/${twitter.replace('@', '')}`)
      ]
    };
  } else if (platform === 'email') {
    return {
      type: 'action',
      action: 'contact-send'
    };
  } else {
    return {
      type: 'text',
      content: [formatError(`Unknown platform '${platform}'. Use: connect [linkedin|github|twitter|email]`)]
    };
  }
};

const blogHandler = () => {
  return {
    type: 'text',
    content: [
      ...formatSection("RAZA'S BLOG ARTICLES"),
      `• ${formatSuccess('Building Scalable RAG Pipelines with FAISS and LangChain')}`,
      `  A detailed guide to chunking strategies, semantic overlays, and similarity search indexing.`,
      `  Read: ${formatLink('Read Article', 'https://medium.com')}`,
      '',
      `• ${formatSuccess('Fine-Tuning YOLOv8 for Multi-Object Tracking')}`,
      `  How to train models on custom video datasets using PyTorch and optimize for real-time OpenCV threads.`,
      `  Read: ${formatLink('Read Article', 'https://medium.com')}`,
      '',
      `• ${formatSuccess('Modern Retro UI States in React 19')}`,
      `  An inside look at dragging, multitasking window architectures inside single-page web portfolios.`,
      `  Read: ${formatLink('Read Article', 'https://medium.com')}`,
      ''
    ]
  };
};

const toolsHandler = () => {
  return {
    type: 'text',
    content: [
      ...formatSection('DEVELOPMENT TOOLS & SOFTWARE'),
      `• Code Editors  : VS Code, Cursor, JetBrains PyCharm`,
      `• Versioning    : Git, GitHub, GitLab CI/CD`,
      `• Design        : Figma (UI designs, wireframes)`,
      `• Productivity  : Windows Terminal, Zsh, Vim`,
      `• ML Tools      : Jupyter Notebooks, Google Colab, TensorBoard`,
      `• Virtualization: Docker, Docker Compose, AWS EC2/S3`,
      `• APIs/Testing  : Postman, FastAPI docs, Swagger`
    ]
  };
};

const funFactHandler = () => {
  const idx = Math.floor(Math.random() * funFacts.length);
  return {
    type: 'text',
    content: [
      ...formatSection('RANDOM FACT'),
      formatSuccess(funFacts[idx]),
      ''
    ]
  };
};

const asciiArtHandler = () => {
  return {
    type: 'text',
    content: [
      "    ╔═══════════════════════════════════╗",
      "    ║   RAZA ALI - AI/ML ENGINEER       ║",
      "    ║   Making terminals interactive    ║",
      "    ╚═══════════════════════════════════╝"
    ]
  };
};

const lsHandler = (args, context) => {
  const isLa = args.includes('-la') || args.includes('-a');
  const pathArg = args.filter(a => !a.startsWith('-'))[0];
  const current = context.currentPath || '/portfolio';
  const target = pathArg ? resolveAbsolutePath(current, pathArg) : current;
  
  const item = getFsItem(target);
  if (!item) {
    return {
      type: 'text',
      content: [formatError(`ls: cannot access '${pathArg || ''}': No such file or directory`)]
    };
  }
  
  if (item.type !== 'dir') {
    return {
      type: 'text',
      content: [item.name]
    };
  }
  
  const lines = [];
  item.children.forEach(childName => {
    const childPath = target === '/' ? `/${childName}` : `${target}/${childName}`;
    const child = getFsItem(childPath);
    if (!child) return;
    if (child.hidden && !isLa) return;
    
    if (isLa) {
      const typeChar = child.type === 'dir' ? 'd' : '-';
      const sizeStr = (child.size || 0).toString().padStart(8, ' ');
      const nameStr = child.type === 'dir' ? formatInfo(child.name + '/') : child.name;
      lines.push(`${typeChar}r-xr-xr-x visitor staff ${sizeStr} Jun 26 12:00 ${nameStr}`);
    } else {
      const nameStr = child.type === 'dir' ? formatInfo(child.name + '/') : child.name;
      lines.push(nameStr);
    }
  });
  
  return { type: 'text', content: lines };
};

const catHandler = (args, context) => {
  const filename = args[0];
  if (!filename) {
    return { type: 'text', content: [formatError("Usage: cat [filename]")] };
  }
  const current = context.currentPath || '/portfolio';
  const target = resolveAbsolutePath(current, filename);
  const item = getFsItem(target);
  if (!item || item.type !== 'file') {
    return {
      type: 'text',
      content: [formatError(`cat: ${filename}: No such file or directory`)]
    };
  }
  return { type: 'text', content: item.content };
};

const searchHandler = (args) => {
  const keyword = args.join(' ').toLowerCase().trim();
  if (!keyword) {
    return { type: 'text', content: [formatError("Usage: find [keyword]")] };
  }
  
  const results = [...formatSection(`SEARCH RESULTS FOR '${keyword.toUpperCase()}'`)];
  let found = false;

  const highlight = (text) => {
    if (typeof text !== 'string') return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, `<strong class="text-success">$1</strong>`);
  };

  const matchingProj = portfolioData.projects.filter(p => 
    p.name.toLowerCase().includes(keyword) || 
    p.description.toLowerCase().includes(keyword) || 
    p.longDescription.toLowerCase().includes(keyword) || 
    p.tech.toLowerCase().includes(keyword)
  );
  if (matchingProj.length > 0) {
    found = true;
    results.push(formatWarning("[ PROJECTS ]"));
    matchingProj.forEach(p => {
      results.push(`  • Project: ${highlight(p.name)}`);
      results.push(`    Tech   : ${highlight(p.tech)}`);
      results.push(`    Desc   : ${highlight(p.description)}`);
      results.push('');
    });
  }

  const matchingSkills = [];
  Object.entries(portfolioData.skills).forEach(([cat, list]) => {
    list.forEach(s => {
      if (s.name.toLowerCase().includes(keyword)) {
        matchingSkills.push({ name: s.name, cat: cat.replace('_', '/') });
      }
    });
  });
  if (matchingSkills.length > 0) {
    found = true;
    results.push(formatWarning("[ SKILLS ]"));
    matchingSkills.forEach(s => {
      results.push(`  • Skill: ${highlight(s.name)} (Category: ${s.cat})`);
    });
    results.push('');
  }

  const matchingExp = portfolioData.experience.filter(job => 
    job.role.toLowerCase().includes(keyword) || 
    job.company.toLowerCase().includes(keyword) || 
    job.details.some(d => d.toLowerCase().includes(keyword))
  );
  if (matchingExp.length > 0) {
    found = true;
    results.push(formatWarning("[ EXPERIENCE ]"));
    matchingExp.forEach(job => {
      results.push(`  • Position: ${highlight(job.role)} at ${highlight(job.company)} (${job.period})`);
      job.details.forEach(d => {
        if (d.toLowerCase().includes(keyword)) {
          results.push(`    - ${highlight(d)}`);
        }
      });
      results.push('');
    });
  }

  if (!found) {
    results.push(formatInfo(`No matches found for '${keyword}'.`));
  }

  return { type: 'text', content: results };
};

const commandsListHandler = () => {
  const sorted = [...commands].sort((a, b) => a.name.localeCompare(b.name));
  const lines = [...formatSection('COMMANDS REGISTRY')];
  
  const getCatLabel = (name) => {
    const system = ['clear', 'ls', 'dir', 'cd', 'pwd', 'path', 'cat', 'history', 'theme', 'color-scheme', 'system-info', 'info', 'download', 'help'];
    const portfolio = ['resume', 'cv', 'experience', 'exp', 'education', 'edu', 'skills', 'stack', 'tech', 'stack-details', 'projects', 'portfolio', 'open-project', 'github'];
    const info = ['contact', 'email', 'hire-me', 'available', 'connect', 'blog', 'articles', 'stats', 'metrics', 'tools', 'software', 'share'];
    
    if (system.includes(name)) return formatInfo('[System]   ');
    if (portfolio.includes(name)) return formatSuccess('[Portfolio]');
    if (info.includes(name)) return formatWarning('[Info]     ');
    return `<span class="text-error">[Fun]      </span>`;
  };

  sorted.forEach(c => {
    lines.push(`  ${getCatLabel(c.name)}  ${c.name.padEnd(16)} - ${c.description}`);
  });
  
  lines.push('');
  lines.push(formatSuccess(`Total commands registered: ${commands.length}`));
  return { type: 'text', content: lines };
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
  },
  {
    name: 'skills',
    description: 'Display technical skills as ASCII bar chart or grouped categories',
    usage: 'skills [--detailed]',
    examples: ['skills', 'skills --detailed'],
    handler: skillsHandler
  },
  {
    name: 'stack',
    description: 'Alias for skills',
    usage: 'stack [--detailed]',
    examples: ['stack'],
    handler: skillsHandler
  },
  {
    name: 'tech',
    description: 'Detailed breakdown of current technical stack and focus',
    usage: 'tech',
    examples: ['tech'],
    handler: techHandler
  },
  {
    name: 'stack-details',
    description: 'Alias for tech',
    usage: 'stack-details',
    examples: ['stack-details'],
    handler: techHandler
  },
  {
    name: 'projects',
    description: 'List portfolio projects with optional filtering and sorting',
    usage: 'projects [--ml|--web|--cpp|--featured] [--sort DATE|STARS|TECH]',
    examples: ['projects', 'projects --ml', 'projects --sort stars'],
    handler: projectsHandler
  },
  {
    name: 'portfolio',
    description: 'Alias for projects',
    usage: 'portfolio [--ml|--web|--cpp|--featured] [--sort DATE|STARS|TECH]',
    examples: ['portfolio'],
    handler: projectsHandler
  },
  {
    name: 'open-project',
    description: 'Show detailed project information including code repositories and features',
    usage: 'open-project [project_name]',
    examples: ['open-project Enterprise-RAG-Pipeline'],
    handler: openProjectHandler
  },
  {
    name: 'github',
    description: 'Fetch and display real-time GitHub profile, repositories, or activity stats',
    usage: 'github [--user|--repos|--stats|--activity]',
    examples: ['github', 'github --repos', 'github --activity'],
    handler: (args) => {
      let option = 'user';
      if (args.includes('--repos')) option = 'repos';
      else if (args.includes('--stats')) option = 'stats';
      else if (args.includes('--activity')) option = 'activity';
      
      return {
        type: 'github-api',
        option: option
      };
    }
  },
  {
    name: 'contact',
    description: 'Display contact details (email, LinkedIn, GitHub, Location) or send a message',
    usage: 'contact [--send]',
    examples: ['contact', 'contact --send'],
    handler: contactHandler
  },
  {
    name: 'email',
    description: 'Alias for contact',
    usage: 'email [--send]',
    examples: ['email'],
    handler: contactHandler
  },
  {
    name: 'hire-me',
    description: 'Show availability, rates, and engagement options',
    usage: 'hire-me',
    examples: ['hire-me'],
    handler: hireMeHandler
  },
  {
    name: 'available',
    description: 'Alias for hire-me',
    usage: 'available',
    examples: ['available'],
    handler: hireMeHandler
  },
  {
    name: 'connect',
    description: 'Provides profiles links or direct message flow for platforms',
    usage: 'connect [linkedin|github|twitter|email]',
    examples: ['connect linkedin', 'connect email'],
    handler: connectHandler
  },
  {
    name: 'blog',
    description: 'List recent blog posts and articles written by Raza',
    usage: 'blog',
    examples: ['blog'],
    handler: blogHandler
  },
  {
    name: 'articles',
    description: 'Alias for blog',
    usage: 'articles',
    examples: ['articles'],
    handler: blogHandler
  },
  {
    name: 'stats',
    description: 'Show real-time GitHub contributions and account metrics',
    usage: 'stats',
    examples: ['stats'],
    handler: () => ({ type: 'github-api', option: 'stats' })
  },
  {
    name: 'metrics',
    description: 'Alias for stats',
    usage: 'metrics',
    examples: ['metrics'],
    handler: () => ({ type: 'github-api', option: 'stats' })
  },
  {
    name: 'tools',
    description: 'List development tools, editors, and utilities regularly used',
    usage: 'tools',
    examples: ['tools'],
    handler: toolsHandler
  },
  {
    name: 'software',
    description: 'Alias for tools',
    usage: 'software',
    examples: ['software'],
    handler: toolsHandler
  },
  {
    name: 'ask',
    description: "Ask Raza's AI assistant a question authentically answered in the first person",
    usage: 'ask [question]',
    examples: ['ask what is your RAG stack?', 'ask why should I hire you?'],
    handler: (args) => {
      const query = args.join(' ');
      if (!query) {
        return {
          type: 'text',
          content: [
            formatWarning("Usage: ask [your question]"),
            '',
            "Example:",
            "  ask what makes you different as an engineer?"
          ]
        };
      }
      return {
        type: 'ai-assistant',
        query: query
      };
    }
  },
  {
    name: 'chat',
    description: "Start an interactive chat session with Raza's AI assistant",
    usage: 'chat [optional_question]',
    examples: ['chat', 'chat tell me about your projects'],
    handler: (args) => {
      const query = args.join(' ');
      if (query) {
        return {
          type: 'ai-assistant',
          query: query
        };
      }
      return {
        type: 'action',
        action: 'chat-interactive'
      };
    }
  },
  {
    name: 'random-fact',
    description: 'Display a random technology or personal fact about Raza',
    usage: 'random-fact',
    examples: ['random-fact'],
    handler: funFactHandler
  },
  {
    name: 'fun-fact',
    description: 'Alias for random-fact',
    usage: 'fun-fact',
    examples: ['fun-fact'],
    handler: funFactHandler
  },
  {
    name: 'matrix',
    description: 'Display falling green Matrix character rain screensaver',
    usage: 'matrix',
    examples: ['matrix'],
    handler: () => ({ type: 'action', action: 'matrix' })
  },
  {
    name: 'screensaver',
    description: 'Alias for matrix',
    usage: 'screensaver',
    examples: ['screensaver'],
    handler: () => ({ type: 'action', action: 'matrix' })
  },
  {
    name: 'ascii-art',
    description: 'Display an ASCII art header banner of my brand name',
    usage: 'ascii-art',
    examples: ['ascii-art'],
    handler: asciiArtHandler
  },
  {
    name: 'banner',
    description: 'Alias for ascii-art',
    usage: 'banner',
    examples: ['banner'],
    handler: asciiArtHandler
  },
  {
    name: 'ls',
    description: 'List simulated directory contents',
    usage: 'ls [-la] [directory_path]',
    examples: ['ls', 'ls -la', 'ls projects'],
    handler: lsHandler
  },
  {
    name: 'dir',
    description: 'Alias for ls',
    usage: 'dir',
    examples: ['dir'],
    handler: lsHandler
  },
  {
    name: 'cd',
    description: 'Change simulated working directory',
    usage: 'cd [directory_path]',
    examples: ['cd projects', 'cd ..', 'cd /'],
    handler: (args, context) => {
      const pathArg = args[0];
      const current = context.currentPath || '/portfolio';
      const target = resolveAbsolutePath(current, pathArg);
      const item = getFsItem(target);
      if (!item || item.type !== 'dir') {
        return {
          type: 'text',
          content: [formatError(`cd: ${pathArg || ''}: Directory not found`)]
        };
      }
      return {
        type: 'action',
        action: 'cd',
        path: target
      };
    }
  },
  {
    name: 'cat',
    description: 'Concatenate and display the content of simulated files',
    usage: 'cat [file_name]',
    examples: ['cat resume.pdf', 'cat about/about.txt'],
    handler: catHandler
  },
  {
    name: 'pwd',
    description: 'Print simulated working directory',
    usage: 'pwd',
    examples: ['pwd'],
    handler: (args, context) => {
      return {
        type: 'text',
        content: [context.currentPath || '/portfolio']
      };
    }
  },
  {
    name: 'path',
    description: 'Alias for pwd',
    usage: 'path',
    examples: ['path'],
    handler: (args, context) => {
      return {
        type: 'text',
        content: [context.currentPath || '/portfolio']
      };
    }
  },
  {
    name: 'find',
    description: 'Search across all portfolio content (projects, experience, skills)',
    usage: 'find [keyword]',
    examples: ['find ml', 'find react'],
    handler: searchHandler
  },
  {
    name: 'search',
    description: 'Alias for find',
    usage: 'search [keyword]',
    examples: ['search backend'],
    handler: searchHandler
  },
  {
    name: 'ls-commands',
    description: 'List all commands grouped by category with a clean registry grid',
    usage: 'ls-commands',
    examples: ['ls-commands'],
    handler: commandsListHandler
  },
  {
    name: 'commands',
    description: 'Alias for ls-commands',
    usage: 'commands',
    examples: ['commands'],
    handler: commandsListHandler
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
