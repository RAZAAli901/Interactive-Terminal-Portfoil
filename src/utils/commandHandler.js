import { formatTable, formatSuccess, formatError, formatInfo, formatWarning, formatSection, formatBadge, formatLink, formatCode } from './terminalFormatting';
import { getFuzzyMatches } from './fuzzyMatch';
import { getHistory } from './localStorage';
import portfolioData from '../data/portfolio.json';
import { funFacts } from '../data/funFacts';
import { resolveAbsolutePath, getFsItem } from './fileSystem';
import { easterEggs } from '../data/easterEggs';

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
  const { linkedin, github, twitter } = portfolioData.bio;
  
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

// fastfetch/neofetch — Arch logo + portfolio "system info".
const fastfetchHandler = () => {
  const b = portfolioData.bio;
  const cyan = (s) => `<span style="color:#89dceb">${s}</span>`;
  const blue = (s) => `<span style="color:#89b4fa">${s}</span>`;
  const mauve = (s) => `<span style="color:#cba6f7">${s}</span>`;
  const label = (s) => `<span style="color:#cba6f7;font-weight:600">${s}</span>`;

  const langs = portfolioData.skills.languages.map((l) => l.name).join(', ');
  const featured = portfolioData.projects.filter((p) => p.featured).length;
  const yrs = new Date().getFullYear() - 2021;

  const art = [
    '                  ',
    '        /\\        ',
    '       /  \\       ',
    '      /\\   \\      ',
    '     /  ::  \\     ',
    '    /  :::.  \\    ',
    '   /  :::::.  \\   ',
    '  / ::-----:: \\  ',
    ' /_:-\'\'    \'\'-:_\\ ',
    '                  ',
  ];

  const info = [
    `${label('raza')}@${label('portfolio')}`,
    '─────────────────────',
    `${label('OS')}: Arch Linux x86_64`,
    `${label('WM')}: Hyprland`,
    `${label('Shell')}: portfolio-sh`,
    `${label('Role')}: ${b.title}`,
    `${label('Location')}: ${b.location}`,
    `${label('Uptime')}: ${yrs} yrs coding`,
    `${label('Languages')}: ${langs}`,
    `${label('Projects')}: ${featured} featured`,
    `${label('Contact')}: ${b.email}`,
  ];

  const rows = art.map((a, i) => `${cyan(a)}  ${info[i] || ''}`);
  return {
    type: 'text',
    content: [
      ...rows,
      '',
      `${blue('●')} ${mauve('●')} <span style="color:#f38ba8">●</span> <span style="color:#a6e3a1">●</span> <span style="color:#f9e2af">●</span> <span style="color:#89dceb">●</span>`,
      '',
      formatInfo("Type 'help' for commands, or 'projects' to explore my work."),
    ],
  };
};

// hyprctl — query the (simulated) Hyprland compositor.
const hyprctlHandler = (args) => {
  const sub = (args[0] || '').toLowerCase();
  const accent = (s) => `<span style="color:#cba6f7">${s}</span>`;
  if (sub === 'monitors') {
    return { type: 'text', content: [
      accent('Monitor DP-1 (ID 0):'),
      '  2560x1440@165.00000 at 0x0',
      '  description: Portfolio Virtual Display',
      '  make: Hyprland  model: WEB  scale: 1.00',
      '  activeWorkspace: 1 (1)   focused: yes',
    ] };
  }
  if (sub === 'workspaces') {
    return { type: 'text', content: [1, 2, 3, 4, 5].flatMap((n) => [
      accent(`workspace ID ${n} (${n}) on monitor DP-1:`),
      '  monitor: DP-1',
      '  windows: dynamic (dwindle)',
      '',
    ]) };
  }
  if (sub === 'version' || !sub) {
    return { type: 'text', content: [
      accent('Hyprland 0.41.2 (web build)'),
      'Tag: v0.41.2, commit portfolio',
      'flags: (built with anime.js + React 19)',
      '',
      formatInfo("usage: hyprctl [monitors | workspaces | version]"),
    ] };
  }
  return { type: 'text', content: [formatError(`hyprctl: unknown request '${sub}'`), "Try: monitors, workspaces, version"] };
};

// htop — a snapshot of the (fake) process table.
const htopHandler = () => {
  const rows = [
    ['1', 'razaali', 'Hyprland', '1.9', '212M', 'S'],
    ['2', 'razaali', 'waybar', '0.6', '48M', 'S'],
    ['3', 'razaali', 'kitty', '1.2', '96M', 'R'],
    ['4', 'razaali', 'firefox', '4.8', '812M', 'S'],
    ['5', 'razaali', 'code', '3.1', '540M', 'S'],
    ['6', 'razaali', 'wofi', '0.2', '22M', 'S'],
    ['7', 'razaali', 'pipewire', '0.3', '18M', 'S'],
  ];
  return { type: 'text', content: [
    formatSuccess('  CPU[|||||||||       23%]   Mem[||||||||||     38%]'),
    '',
    ...formatTable(['PID', 'USER', 'COMMAND', 'CPU%', 'MEM', 'S'], rows),
  ] };
};

// cava — a static frame of an audio visualiser.
const cavaHandler = () => {
  const bars = ['▂', '▄', '▆', '█', '▆', '▅', '▃', '▂', '▄', '▇', '█', '▆', '▄', '▂', '▁', '▃', '▅', '▇', '█', '▆'];
  const line = (offset) => bars.map((b, i) => `<span style="color:#89b4fa">${bars[(i + offset) % bars.length]}</span>`).join('');
  return { type: 'text', content: [line(0), line(2), line(5), formatInfo('(cava — a real terminal would animate these to your audio)')] };
};

const unameHandler = (args) => {
  const all = args.includes('-a');
  return { type: 'text', content: [
    all
      ? 'Linux razaali 6.9.7-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux'
      : 'Linux',
  ] };
};

const uptimeHandler = () => {
  const yrs = new Date().getFullYear() - 2021;
  return { type: 'text', content: [
    ` ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} up ${yrs}y, 3 users, load average: 0.42, 0.35, 0.28`,
  ] };
};

const freeHandler = () => {
  return { type: 'text', content: [
    ...formatTable(['', 'total', 'used', 'free', 'shared', 'buff/cache', 'available'], [
      ['Mem:', '32Gi', '12Gi', '14Gi', '640Mi', '5.6Gi', '19Gi'],
      ['Swap:', '8.0Gi', '0B', '8.0Gi', '', '', ''],
    ]),
  ] };
};

const whoamiHandler = () => ({ type: 'text', content: ['razaali'] });

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

const themeHandler = (args) => {
  const raw = args[0] ? args[0].toLowerCase() : null;
  const themes = ['catppuccin-mocha', 'catppuccin-latte', 'tokyo-night', 'gruvbox', 'nord', 'dracula', 'rose-pine'];
  // Accept friendly aliases for the Catppuccin variants.
  const aliases = { mocha: 'catppuccin-mocha', latte: 'catppuccin-latte', catppuccin: 'catppuccin-mocha', tokyo: 'tokyo-night', tokyonight: 'tokyo-night', rosepine: 'rose-pine', rose: 'rose-pine' };
  const target = raw ? (aliases[raw] || raw) : null;
  if (!target) {
    return {
      type: 'text',
      content: [
        ...formatSection('THEME SCHEMES'),
        "Usage: theme [theme-name]",
        "",
        "Available themes:",
        ...themes.map(t => `  • ${t}`)
      ]
    };
  }
  if (!themes.includes(target)) {
    return {
      type: 'text',
      content: [
        formatError(`Unknown theme '${target}'.`),
        `Available themes: ${themes.join(', ')}`
      ]
    };
  }
  return {
    type: 'action',
    action: 'theme',
    theme: target
  };
};

const systemInfoHandler = () => {
  let uptime = '1m 24s';
  if (window.performance && window.performance.now) {
    const ms = window.performance.now();
    const secs = Math.floor(ms / 1000) % 60;
    const mins = Math.floor(ms / 60000) % 60;
    const hrs = Math.floor(ms / 3600000);
    uptime = `${hrs > 0 ? hrs + 'h ' : ''}${mins > 0 ? mins + 'm ' : ''}${secs}s`;
  }
  return {
    type: 'text',
    content: [
      "       .---.",
      "      /     \\",
      "      | O_O |",
      "      |  _  |",
      "      \\_____/",
      "",
      `OS       : Interactive Terminal Portfolio v1.0`,
      `Kernel   : React 19 + Vite`,
      `Uptime   : ${uptime}`,
      `Terminal : xterm-256color`,
      `Shell    : /bin/portfolio`,
      `User     : Raza Ali`,
      `CPU      : 100% Brain Power`,
      `Memory   : Infinite Creativity`
    ]
  };
};

const downloadHandler = (args) => {
  const filename = args[0] ? args[0].toLowerCase() : null;
  if (!filename) {
    return {
      type: 'text',
      content: [
        formatError("Usage: download [filename]"),
        "Available files:",
        "  • resume.pdf",
        "  • portfolio.json",
        "  • cv.txt"
      ]
    };
  }
  const validFiles = ['resume.pdf', 'portfolio.json', 'cv.txt'];
  if (!validFiles.includes(filename)) {
    return {
      type: 'text',
      content: [formatError(`File '${filename}' not found for download.`)]
    };
  }
  return {
    type: 'action',
    action: 'download',
    file: filename
  };
};

const shareHandler = (args) => {
  const type = args[0] ? args[0].toLowerCase() : null;
  const name = args.slice(1).join(' ');
  
  if (!type) {
    return {
      type: 'text',
      content: [
        formatWarning("Usage: share [resume|portfolio|project [project-name]]"),
        "",
        "Examples:",
        "  share portfolio",
        "  share project Enterprise-RAG-Pipeline"
      ]
    };
  }
  
  const portfolioUrl = window.location.origin + window.location.pathname;
  
  if (type === 'portfolio') {
    const text = `Check out Raza Ali Murtaza's Interactive Terminal Portfolio: ${portfolioUrl}`;
    return {
      type: 'text',
      content: [
        ...formatSection('SHARE PORTFOLIO'),
        `Link: ${formatLink(portfolioUrl, portfolioUrl)}`,
        '',
        formatWarning('Pre-filled Share Message:'),
        formatCode(text),
        '',
        formatInfo('Link copied to clipboard (simulated)!')
      ]
    };
  } else if (type === 'resume') {
    const resumeUrl = `${portfolioUrl}resume.pdf`;
    const text = `Check out Raza Ali Murtaza's Resume/CV: ${resumeUrl}`;
    return {
      type: 'text',
      content: [
        ...formatSection('SHARE RESUME'),
        `Link: ${formatLink('Raza_Ali_Murtaza_Resume.pdf', resumeUrl)}`,
        '',
        formatWarning('Pre-filled Share Message:'),
        formatCode(text)
      ]
    };
  } else if (type === 'project') {
    if (!name) {
      return { type: 'text', content: [formatError("Usage: share project [project-name]")] };
    }
    const proj = portfolioData.projects.find(p => p.name.toLowerCase() === name.toLowerCase() || p.id.toLowerCase() === name.toLowerCase());
    if (!proj) {
      return { type: 'text', content: [formatError(`Project '${name}' not found.`)] };
    }
    const text = `Check out this project by Raza Ali Murtaza: ${proj.name} - ${proj.description} (${proj.repoUrl})`;
    return {
      type: 'text',
      content: [
        ...formatSection(`SHARE PROJECT: ${proj.name.toUpperCase()}`),
        `Repo Link: ${formatLink(proj.name, proj.repoUrl)}`,
        '',
        formatWarning('Pre-filled Share Message:'),
        formatCode(text)
      ]
    };
  } else {
    return { type: 'text', content: [formatError(`Unknown share type '${type}'. Use: share [resume|portfolio|project]`)] };
  }
};

const secretHandler = () => {
  return {
    type: 'text',
    content: [
      ...formatSection('SECRET ARCHIVES'),
      "🕵️ There are 10 hidden easter egg commands in this terminal.",
      "Try typing some of these hidden keywords to unlock cheat codes and joke responses:",
      "  • hack",
      "  • coffee",
      "  • halo",
      "  • life",
      "  • sudo make-me-a-sandwich",
      "  • konami-code",
      "",
      formatInfo("Good luck finding them all!")
    ]
  };
};

// Will hold the full commands registry

// ─── Dino Master: secret command unlocked by reaching 999 in the Dino game ───
const dinoMasterHandler = () => {
  return {
    type: 'text',
    content: [
      ...formatSection('🦖 DINO MASTER — CLASSIFIED'),
      formatSuccess('🏆 Congratulations, LEGEND! You survived the prehistoric gauntlet!'),
      '',
      '┌────────────────────────────────────────────────────────┐',
      '│             *** TOP SECRET CLEARANCE ***               │',
      '│  You have unlocked the Dino Master achievement by      │',
      '│  reaching 999 points in the Chrome Dino Game.         │',
      '│                                                        │',
      '│  ACCESS CODE: DINO-T-REX-999-LEGEND                   │',
      '│  RANK: ★★★★★ APEX PREDATOR                           │',
      '└────────────────────────────────────────────────────────┘',
      '',
      formatWarning('Unlocked hidden knowledge:'),
      '  🦕 Fun Fact: The T-Rex\'s tiny arms were actually incredibly strong',
      '      — they could lift up to 430 lbs each!',
      '',
      '  🧬 Fun Fact: Dinosaurs ruled Earth for 165 million years.',
      '      Humans? Just 0.003% of that. You out-survived everything.',
      '',
      '  🌋 Fun Fact: The asteroid that killed the dinos was only',
      '      ~10km wide — but released 10 billion Hiroshima bombs of energy.',
      '',
      formatSuccess('Secret portfolio note: Raza builds things that survive extinction events. 🚀'),
      '',
      formatInfo('Try: open-project Enterprise-RAG-Pipeline | skills --detailed | ask'),
    ]
  };
};


const weatherHandler = (args) => {
  const loc = args.join(' ') || 'Lahore, PK';
  return {
    type: 'text',
    content: [
      ...formatSection(`WEATHER REPORT: ${loc.toUpperCase()}`),
      `Status     : ${formatBadge('success', 'current')} Mostly Clear / Cyber-haze`,
      `Temperature: 28°C (Feels like 31°C)`,
      `Wind       : 12 km/h North-East | Humidity: 65%`,
      ``,
      `3-Day Forecast:`,
      `  ┌────────────┬────────────┬────────────┐`,
      `  │ Tomorrow   │ Day After  │ Next Day   │`,
      `  ├────────────┼────────────┼────────────┤`,
      `  │ 🌤️ 29°C    │ ⛈️ 24°C     │ ☀️ 31°C     │`,
      `  │ Sunny      │ Rainstorm  │ Hot        │`,
      `  └────────────┴────────────┴────────────┘`
    ]
  };
};


const dateHandler = () => {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const calendarLines = [' S  M  T  W  T  F  S'];
  let currentWeek = ' '.repeat(firstDay * 3);
  for (let day = 1; day <= totalDays; day++) {
    const isToday = day === now.getDate();
    const dayStr = day.toString().padStart(2, ' ');
    currentWeek += isToday ? `<span class="text-success">${dayStr}</span> ` : `${dayStr} `;
    if ((day + firstDay) % 7 === 0 || day === totalDays) {
      calendarLines.push(currentWeek);
      currentWeek = '';
    }
  }
  return {
    type: 'text',
    content: [
      ...formatSection('SYSTEM DATE & CALENDAR'),
      `Local Time : ${now.toString()}`,
      `Month      : ${months[now.getMonth()]} ${now.getFullYear()}`,
      ``,
      ...calendarLines,
      ``
    ]
  };
};


const quotes = [
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. - Martin Fowler",
  "First, solve the problem. Then, write the code. - John Johnson",
  "Experience is the name everyone gives to their mistakes. - Oscar Wilde",
  "In order to be irreplaceable one must always be different. - Coco Chanel",
  "Java is to JavaScript what car is to Carpet. - Chris Heilmann",
  "Code is like humor. When you have to explain it, it’s bad. - Cory House",
  "Simplicity is the soul of efficiency. - Austin Freeman"
];
const quoteHandler = () => {
  const idx = Math.floor(Math.random() * quotes.length);
  return {
    type: 'text',
    content: [
      ...formatSection('DAILY PROGRAMMING QUOTE'),
      `"${quotes[idx]}"`,
      ``
    ]
  };
};


const ipconfigHandler = () => {
  return {
    type: 'text',
    content: [
      ...formatSection('WINDOWS IP CONFIGURATION'),
      ``,
      `Ethernet adapter Ethernet0:`,
      `   Connection-specific DNS Suffix  . : dynamic.fiber.net`,
      `   IPv6 Address. . . . . . . . . . . : fe80::a1b2:c3d4:e5f6:7890%4`,
      `   IPv4 Address. . . . . . . . . . . : 192.168.1.105`,
      `   Subnet Mask . . . . . . . . . . . : 255.255.255.0`,
      `   Default Gateway . . . . . . . . . : 192.168.1.1`,
      ``,
      `Wireless LAN adapter Wi-Fi:`,
      `   Media State . . . . . . . . . . . : Media disconnected`,
      `   Connection-specific DNS Suffix  . : `,
      ``,
      `Tunnel adapter isolated-con:`,
      `   Connection-specific DNS Suffix  . : `,
      `   IPv4 Address. . . . . . . . . . . : 10.0.75.1`,
      `   Subnet Mask . . . . . . . . . . . : 255.255.255.0`
    ]
  };
};

export const commands = [
  {
    name: 'dino-master',
    description: '🦖 [SECRET] Unlocked by reaching 999 score in the Dino game inside the Browser app',
    usage: 'dino-master',
    examples: ['dino-master'],
    handler: dinoMasterHandler
  },
  {
    name: 'weather',
    description: 'Display mock current weather and forecast for Lahore or your location',
    usage: 'weather [location]',
    examples: ['weather', 'weather Lahore'],
    handler: weatherHandler
  },

  {
    name: 'date',
    description: 'Display current system date and calendar grid',
    usage: 'date',
    examples: ['date', 'cal'],
    handler: dateHandler
  },
  {
    name: 'cal',
    description: 'Alias for date',
    usage: 'cal',
    examples: ['cal'],
    handler: dateHandler
  },
  {
    name: 'quote',
    description: 'Output a random inspiring software engineering quote',
    usage: 'quote',
    examples: ['quote'],
    handler: quoteHandler
  },
  {
    name: 'ipconfig',
    description: 'Display simulated network interface addresses and gateway settings',
    usage: 'ipconfig',
    examples: ['ipconfig', 'ifconfig'],
    handler: ipconfigHandler
  },
  {
    name: 'ifconfig',
    description: 'Alias for ipconfig',
    usage: 'ifconfig',
    examples: ['ifconfig'],
    handler: ipconfigHandler
  },
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
    name: 'fastfetch',
    description: 'Show an Arch/Hyprland-style system info card with my profile',
    usage: 'fastfetch',
    examples: ['fastfetch'],
    handler: fastfetchHandler
  },
  {
    name: 'neofetch',
    description: 'Alias for fastfetch',
    usage: 'neofetch',
    examples: ['neofetch'],
    handler: fastfetchHandler
  },
  {
    name: 'hyprctl',
    description: 'Query the simulated Hyprland compositor (monitors, workspaces, version)',
    usage: 'hyprctl [monitors|workspaces|version]',
    examples: ['hyprctl version', 'hyprctl monitors', 'hyprctl workspaces'],
    handler: hyprctlHandler
  },
  {
    name: 'htop',
    description: 'Show a snapshot of running processes',
    usage: 'htop',
    examples: ['htop'],
    handler: htopHandler
  },
  {
    name: 'cava',
    description: 'Console audio visualiser (static frame)',
    usage: 'cava',
    examples: ['cava'],
    handler: cavaHandler
  },
  {
    name: 'uname',
    description: 'Print system / kernel information',
    usage: 'uname [-a]',
    examples: ['uname', 'uname -a'],
    handler: unameHandler
  },
  {
    name: 'uptime',
    description: 'Show how long the system has been running',
    usage: 'uptime',
    examples: ['uptime'],
    handler: uptimeHandler
  },
  {
    name: 'free',
    description: 'Display memory usage',
    usage: 'free [-h]',
    examples: ['free', 'free -h'],
    handler: freeHandler
  },
  {
    name: 'whoami',
    description: 'Print the current user',
    usage: 'whoami',
    examples: ['whoami'],
    handler: whoamiHandler
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
  },
  {
    name: 'theme',
    description: 'Switch terminal color scheme and persist preference',
    usage: 'theme [catppuccin-mocha|catppuccin-latte|tokyo-night|gruvbox|nord|dracula]',
    examples: ['theme tokyo-night', 'theme gruvbox', 'theme'],
    handler: themeHandler
  },
  {
    name: 'color-scheme',
    description: 'Alias for theme',
    usage: 'color-scheme [theme_name]',
    examples: ['color-scheme dracula'],
    handler: themeHandler
  },
  {
    name: 'system-info',
    description: 'Display simulated system-like parameters and uptime metrics',
    usage: 'system-info',
    examples: ['system-info'],
    handler: systemInfoHandler
  },
  {
    name: 'info',
    description: 'Alias for system-info',
    usage: 'info',
    examples: ['info'],
    handler: systemInfoHandler
  },
  {
    name: 'download',
    description: 'Download resume, portfolio JSON, or text CV details',
    usage: 'download [resume.pdf|portfolio.json|cv.txt]',
    examples: ['download resume.pdf'],
    handler: downloadHandler
  },
  {
    name: 'share',
    description: 'Generate copyable link and pre-filled social messages',
    usage: 'share [resume|portfolio|project [name]]',
    examples: ['share portfolio', 'share project Enterprise-RAG-Pipeline'],
    handler: shareHandler
  },
  {
    name: 'easter-egg',
    description: 'Provide hint logs for discovering hidden easter eggs',
    usage: 'easter-egg',
    examples: ['easter-egg'],
    handler: secretHandler
  },
  {
    name: 'secret',
    description: 'Alias for easter-egg',
    usage: 'secret',
    examples: ['secret'],
    handler: secretHandler
  },
  {
    name: 'clear',
    description: 'Clear the terminal output screen with optional keep or confirm flags',
    usage: 'clear [--confirm|--keep N]',
    examples: ['clear', 'clear --confirm', 'clear --keep 5'],
    handler: (args) => {
      if (args.includes('--confirm')) {
        return {
          type: 'action',
          action: 'clear',
          option: 'confirm'
        };
      }
      
      const keepIdx = args.indexOf('--keep');
      if (keepIdx !== -1 && args[keepIdx + 1]) {
        const parsed = parseInt(args[keepIdx + 1], 10);
        if (!isNaN(parsed)) {
          return {
            type: 'action',
            action: 'clear',
            option: 'keep',
            count: parsed
          };
        }
      }
      
      return {
        type: 'action',
        action: 'clear',
        option: 'all'
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

  // Intercept hidden easter eggs first
  const fullLower = trimmed.toLowerCase();
  if (easterEggs[fullLower]) {
    return {
      type: 'text',
      content: easterEggs[fullLower]
    };
  }
  if (easterEggs[cmdName]) {
    return {
      type: 'text',
      content: easterEggs[cmdName]
    };
  }

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
