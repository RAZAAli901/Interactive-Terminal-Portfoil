import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';

// Raw module text, so the "no raw HTML" rule is checked at the source level too.
import codeAppSource from '../apps/CodeApp.jsx?raw';

import AboutApp from '../apps/AboutApp';
import ProjectsApp from '../apps/ProjectsApp';
import FilesApp from '../apps/FilesApp';
import CodeApp from '../apps/CodeApp';
import BrowserApp from '../apps/BrowserApp';
import PowerApp from '../apps/PowerApp';
import NeofetchPanel from '../apps/NeofetchPanel';
import { GITHUB_USER, PROJECTS, cloneUrl, repoUrl } from '../data/projects';

/** Concatenate every real text node under `root` (skips element/comment nodes). */
function textNodeContent(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const parts = [];
  while (walker.nextNode()) parts.push(walker.currentNode.nodeValue);
  return { text: parts.join(''), count: parts.length };
}

describe('<AboutApp>', () => {
  it('renders the name heading and the role subtitle', () => {
    render(<AboutApp />);
    // The `#` prefix is aria-hidden markdown chrome, so the accessible name is bare.
    expect(screen.getByRole('heading', { level: 1, name: 'Raza Ali' })).toBeInTheDocument();
    expect(screen.getByText('AI / Machine Learning Engineer')).toBeInTheDocument();
  });

  it('renders one chip per skill', () => {
    const skills = ['Python', 'PyTorch', 'FAISS'];
    render(<AboutApp skills={skills} />);
    const chips = screen.getByRole('list', { name: /skills/i });
    const items = within(chips).getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual(skills);
  });

  it('renders the default twelve-skill cloud', () => {
    render(<AboutApp />);
    const chips = screen.getByRole('list', { name: /skills/i });
    expect(within(chips).getAllByRole('listitem')).toHaveLength(12);
    expect(within(chips).getByText('LangChain')).toBeInTheDocument();
  });

  it('links to the GitHub profile from a bare handle', () => {
    render(<AboutApp />);
    const link = screen.getByRole('link', { name: 'github.com/RAZAAli901' });
    expect(link).toHaveAttribute('href', 'https://github.com/RAZAAli901');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('accepts a full URL for github and strips the scheme in the label', () => {
    render(<AboutApp github="https://github.com/RAZAAli901/" />);
    const link = screen.getByRole('link', { name: 'github.com/RAZAAli901' });
    expect(link).toHaveAttribute('href', 'https://github.com/RAZAAli901/');
  });
});

describe('<ProjectsApp>', () => {
  it('renders one card per project', () => {
    render(<ProjectsApp />);
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(PROJECTS.length);
    PROJECTS.forEach((project) => {
      expect(screen.getByRole('button', { name: `Open ${project.name}` })).toBeInTheDocument();
    });
  });

  it('shows every tag of every project inside its own card', () => {
    render(<ProjectsApp />);
    PROJECTS.forEach((project) => {
      // Tags repeat across projects ("Python"), so scope the lookup to the card.
      const card = screen.getByRole('button', { name: `Open ${project.name}` });
      project.tags.forEach((tag) => {
        expect(within(card).getByText(tag)).toBeInTheDocument();
      });
      expect(within(card).getByText(project.desc)).toBeInTheDocument();
    });
  });

  it('calls onOpenProject with the clicked card index', () => {
    const onOpenProject = vi.fn();
    render(<ProjectsApp onOpenProject={onOpenProject} />);
    fireEvent.click(screen.getByRole('button', { name: `Open ${PROJECTS[2].name}` }));
    expect(onOpenProject).toHaveBeenCalledTimes(1);
    expect(onOpenProject).toHaveBeenCalledWith(2);
  });

  it('renders an empty list when projects is not an array', () => {
    render(<ProjectsApp projects={null} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});

describe('<FilesApp>', () => {
  it('renders a folder tile per project plus resume.pdf', () => {
    render(<FilesApp />);
    const grid = screen.getByRole('list', { name: 'Contents of ~/projects' });
    const tiles = within(grid).getAllByRole('listitem');
    expect(tiles).toHaveLength(PROJECTS.length + 1);
    PROJECTS.forEach((project) => {
      expect(within(grid).getByRole('button', { name: `Open ${project.name}` })).toBeInTheDocument();
    });
    expect(within(grid).getByText('resume.pdf')).toBeInTheDocument();
  });

  it('renders resume.pdf as a plain tile, not a control', () => {
    render(<FilesApp />);
    // Only the project folders are buttons; the resume entry is decorative.
    expect(screen.getAllByRole('button')).toHaveLength(PROJECTS.length);
    expect(screen.queryByRole('button', { name: /resume\.pdf/i })).not.toBeInTheDocument();
  });

  it('calls onOpenProject with the index of the clicked folder', () => {
    const onOpenProject = vi.fn();
    render(<FilesApp onOpenProject={onOpenProject} />);
    fireEvent.click(screen.getByRole('button', { name: `Open ${PROJECTS[3].name}` }));
    expect(onOpenProject).toHaveBeenCalledWith(3);
  });

  it('tints each folder glyph with its project color', () => {
    render(<FilesApp projects={[{ name: 'demo', color: 'rgb(1, 2, 3)' }]} />);
    const tile = screen.getByRole('button', { name: 'Open demo' });
    expect(tile.querySelector('[aria-hidden="true"]')).toHaveStyle({ color: 'rgb(1, 2, 3)' });
  });
});

describe('<CodeApp>', () => {
  it('renders the explorer entry for rag_pipeline.py as the active file', () => {
    render(<CodeApp />);
    const explorer = screen.getByRole('complementary', { name: 'Explorer' });
    const entry = within(explorer).getByText('rag_pipeline.py');
    expect(entry).toHaveAttribute('aria-current', 'true');
    expect(within(explorer).getByText('llm.py')).toBeInTheDocument();
    expect(within(explorer).getByText('README.md')).toBeInTheDocument();
  });

  it('renders the Python source of the file', () => {
    render(<CodeApp />);
    const pane = screen.getByRole('group', { name: 'rag_pipeline.py source' });
    const code = pane.querySelector('code');
    expect(code.textContent).toContain('from langchain.vectorstores import FAISS');
    expect(code.textContent).toContain('def build_pipeline(docs, k=4):');
    expect(code.textContent).toContain('"sentence-transformers/all-MiniLM-L6-v2"');
  });

  it('renders a line-number gutter with one number per source line', () => {
    render(<CodeApp />);
    const pane = screen.getByRole('group', { name: 'rag_pipeline.py source' });
    const gutter = pane.querySelector('[aria-hidden="true"]');
    const code = pane.querySelector('code');
    const numbers = [...gutter.children].map((el) => el.textContent);
    expect(numbers.length).toBe(code.children.length);
    expect(numbers.length).toBeGreaterThan(30);
    expect(numbers).toEqual(numbers.map((_, i) => String(i + 1)));
  });

  it('renders the code as real text nodes, never as raw HTML', () => {
    render(<CodeApp />);
    const pane = screen.getByRole('group', { name: 'rag_pipeline.py source' });
    const code = pane.querySelector('code');

    const { text, count } = textNodeContent(code);
    expect(count).toBeGreaterThan(50);
    // Everything the pane shows comes from text nodes, so nothing was injected.
    expect(text).toBe(code.textContent);
    expect(text).toContain('RetrievalQA.from_chain_type(');

    // Every leaf token span holds a text node rather than markup.
    const leaves = [...code.querySelectorAll('span')].filter((s) => s.children.length === 0);
    expect(leaves.length).toBeGreaterThan(50);
    leaves.forEach((leaf) => {
      leaf.childNodes.forEach((child) => expect(child.nodeType).toBe(Node.TEXT_NODE));
    });
  });

  it('does not use dangerouslySetInnerHTML', () => {
    expect(codeAppSource).toContain('export default function CodeApp');
    expect(codeAppSource).not.toContain('dangerouslySetInnerHTML');
  });
});

describe('<BrowserApp>', () => {
  it('renders the repo name and URL for the given projectIndex', () => {
    const project = PROJECTS[2];
    render(<BrowserApp projectIndex={2} />);
    expect(
      screen.getByRole('heading', { name: `${GITHUB_USER} / ${project.name}` }),
    ).toBeInTheDocument();
    expect(screen.getByText(`github.com/${GITHUB_USER}/${project.name}`)).toBeInTheDocument();
    expect(screen.getByText(project.desc)).toBeInTheDocument();
  });

  it('defaults to the first project', () => {
    render(<BrowserApp />);
    expect(
      screen.getByRole('heading', { name: `${GITHUB_USER} / ${PROJECTS[0].name}` }),
    ).toBeInTheDocument();
  });

  it('shows the git clone command for the repo', () => {
    render(<BrowserApp projectIndex={1} />);
    expect(screen.getByText(`$ git clone ${cloneUrl(PROJECTS[1].name)}`)).toBeInTheDocument();
    expect(screen.getByText('Clone this repository')).toBeInTheDocument();
  });

  it('links out to GitHub in a new tab safely', () => {
    render(<BrowserApp projectIndex={1} />);
    const cta = screen.getByRole('link', { name: /View on GitHub/ });
    expect(cta).toHaveAttribute('href', repoUrl(PROJECTS[1].name));
    expect(cta).toHaveAttribute('target', '_blank');
    expect(cta.getAttribute('rel')).toContain('noopener');
  });

  it('reports nav clicks and disables the glyphs without a handler', () => {
    const onNavigate = vi.fn();
    const { unmount } = render(<BrowserApp onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(onNavigate).toHaveBeenCalledWith('reload');
    unmount();

    render(<BrowserApp />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
  });
});

describe('<PowerApp>', () => {
  it('renders the sign-off message', () => {
    render(<PowerApp />);
    expect(screen.getByText('Thanks for stopping by.')).toBeInTheDocument();
    expect(screen.getByText(/let's build something/i)).toBeInTheDocument();
  });

  it('links to the GitHub profile with the scheme stripped from the label', () => {
    render(<PowerApp />);
    const link = screen.getByRole('link', { name: `github.com/${GITHUB_USER} ↗` });
    expect(link).toHaveAttribute('href', `https://github.com/${GITHUB_USER}`);
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});

describe('<NeofetchPanel>', () => {
  it('renders the Arch ASCII logo block', () => {
    const { container } = render(<NeofetchPanel />);
    const logo = container.querySelector('pre');
    const lines = logo.textContent.split('\n');
    expect(lines).toHaveLength(16);
    expect(lines[0]).toContain('/\\');
    expect(lines[15]).toContain('/________/');
    // Decorative art must not leak into the accessibility tree.
    expect(logo).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the OS / WM / Shell info keys with their values', () => {
    render(<NeofetchPanel />);
    const panel = screen.getByRole('region', { name: 'neofetch system summary' });
    const pairs = [
      ['OS', 'Arch Linux x86_64'],
      ['WM', 'Hyprland (dwindle)'],
      ['Shell', 'zsh 5.9'],
      ['Kernel', '6.9.4-arch1'],
      ['Terminal', 'kitty'],
    ];
    pairs.forEach(([key, value]) => {
      expect(within(panel).getByText(key)).toBeInTheDocument();
      expect(within(panel).getByText(value)).toBeInTheDocument();
    });
  });

  it('renders the role row from the prop', () => {
    render(<NeofetchPanel role="Robotics Engineer" />);
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Robotics Engineer')).toBeInTheDocument();
  });

  it('derives the shell user from the first name', () => {
    render(<NeofetchPanel name="Zara Khan" />);
    // The header splits `zara`, `@`, `arch` across nodes; the prompt is one span.
    expect(screen.getByText('@').parentElement).toHaveTextContent('zara@arch');
    expect(screen.getByText('zara@arch')).toBeInTheDocument();
  });
});
