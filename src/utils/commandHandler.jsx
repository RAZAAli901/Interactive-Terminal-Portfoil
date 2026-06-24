import Hero from '../sections/Hero';
import About from '../sections/About';
import Projects from '../sections/Projects';
import Contact from '../sections/Contact';

export const handleCommand = (command, { isAdmin, setWallpaper, setIsAdmin } = {}) => {
    const trimmedCommand = command.trim().toLowerCase();
    const args = trimmedCommand.split(' ');
    const cmd = args[0];

    switch (cmd) {
        case 'help':
        case '--help':
            const helpText = [
                'Available commands:',
                '  about     - Learn more about me',
                '  projects  - View my projects',
                '  contact   - Get in touch',
                '  clear     - Clear the terminal',
                '  help      - Show this help message',
                '  fastfetch - Show system info',
                '  ask       - Ask Raza\'s AI Assistant (e.g., ask what stack Raza uses)',
                '  github    - Fetch live GitHub statistics',
                '  skills    - Render ASCII chart of technical skills',
                '  theme     - Switch colors (Dracula, Nord, Monokai, Retro)',
                '  sudo      - Run as administrator',
                '',
                'Type "sudo" to access admin commands.',
            ];
            if (isAdmin) {
                helpText.push('');
                helpText.push('Admin commands:');
                helpText.push('  wallpaper [1-12] - Change desktop wallpaper');
                helpText.push('  exit            - Exit admin mode');
            }
            return {
                type: 'text',
                content: helpText,
            };
        case 'about':
            return { type: 'component', content: <About /> };
        case 'projects':
            return { type: 'component', content: <Projects /> };
        case 'contact':
            return { type: 'component', content: <Contact /> };
        case 'welcome':
            return { type: 'component', content: <Hero /> };
        case 'clear':
            return { type: 'action', action: 'clear' };
        case 'fastfetch':
            return {
                type: 'text',
                content: [
                    '       .---.',
                    '      /     \\',
                    '      | O_O |',
                    '      |  _  |',
                    '      \\_____/',
                    '',
                    'OS:       PortfolioOS v1.0',
                    'Host:     Web Browser',
                    'Kernel:   React 18',
                    'Uptime:   Forever',
                    'Packages: npm, vite',
                    'Shell:    Zsh (simulated)',
                    'Theme:    Retro Terminal',
                    'CPU:      100% Brain Power',
                    'Memory:   Infinite Creativity',
                ],
            };
        case 'sudo':
            return { type: 'action', action: 'sudo' };
        case 'wallpaper':
            if (!isAdmin) {
                return { type: 'text', content: ['Permission denied. Run as root to change wallpaper.'] };
            }
            const wpId = parseInt(args[1]);
            if (wpId >= 1 && wpId <= 12) {
                setWallpaper(wpId);
                return { type: 'text', content: [`Wallpaper changed to ${wpId}.`] };
            } else {
                return { type: 'text', content: ['Usage: wallpaper [1-12]'] };
            }
        case 'exit':
            if (isAdmin) {
                setIsAdmin(false);
                return { type: 'text', content: ['Logged out of root session.'] };
            }
            return { type: 'text', content: ['You are not logged in as root.'] };
        case '':
            return { type: 'text', content: [] };
        case 'ask':
        case 'chat':
            const query = args.slice(1).join(' ');
            if (!query) {
                return {
                    type: 'text',
                    content: [
                        'AI Assistant Command Usage:',
                        '  ask [your question]',
                        '  chat [your question]',
                        '',
                        'Example:',
                        '  ask what stack does Raza use for RAG pipelines?',
                    ],
                };
            }
            return {
                type: 'ai-assistant',
                query: query,
            };
        case 'github':
            return {
                type: 'github-api',
                args: args.slice(1)
            };
        case 'skills':
            return {
                type: 'skills-chart'
            };
        case 'theme':
            const themeName = args[1];
            const validThemes = ['dracula', 'nord', 'monokai', 'retro'];
            if (!themeName || !validThemes.includes(themeName)) {
                return {
                    type: 'text',
                    content: [
                        'Theme Command Usage:',
                        '  theme [name]',
                        '',
                        'Available themes:',
                        '  dracula  - Sleek dark theme with purple accents',
                        '  nord     - Cool arctic blue theme',
                        '  monokai  - Classic contrast coder theme',
                        '  retro    - Green phosphor retro theme',
                    ],
                };
            }
            return {
                type: 'action',
                action: 'theme',
                theme: themeName
            };
        default:
            if (trimmedCommand.startsWith('sudo ')) {
                return { type: 'action', action: 'sudo', pendingCommand: trimmedCommand.slice(5) };
            }
            return {
                type: 'text',
                content: [`Command not found: ${command}. Type 'help' for available commands.`],
            };
    }
};
