/**
 * Client for external API services (GitHub and Simulated AI Q&A)
 */

import { getCachedData, setCachedData } from './localStorage';

/**
 * Fetches data from GitHub REST API with modes or uses cached fallbacks
 * @param {string} mode - 'user' | 'repos' | 'stats' | 'activity'
 * @returns {Promise<object>}
 */
export async function fetchGithubData(mode = 'user') {
  const username = "RAZAAli901";
  const CACHE_KEY = `github_api_${mode}`;
  
  const cached = getCachedData(CACHE_KEY);
  if (cached) return cached;

  try {
    let result;
    if (mode === 'user') {
      const res = await fetch(`https://api.github.com/users/${username}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!res.ok) throw new Error("Rate limit or user not found");
      const data = await res.json();
      result = {
        username: data.login,
        name: data.name || "Raza Ali Murtaza",
        publicRepos: data.public_repos,
        followers: data.followers,
        location: data.location || "Lahore, Pakistan",
        bio: data.bio || "AI/ML Engineer & Full-Stack Developer"
      };
    } else if (mode === 'repos') {
      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=10`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!res.ok) throw new Error("Rate limit or repos not found");
      const data = await res.json();
      // Get top 6 sorted by stars
      result = data
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6)
        .map(r => ({
          name: r.name,
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language || 'JavaScript',
          url: r.html_url
        }));
    } else if (mode === 'stats') {
      const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=50`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!res.ok) throw new Error("Rate limit or repos not found");
      const data = await res.json();
      
      // Calculate language distributions
      const langMap = {};
      let totalStars = 0;
      data.forEach(r => {
        totalStars += r.stargazers_count;
        if (r.language) {
          langMap[r.language] = (langMap[r.language] || 0) + 1;
        }
      });
      
      const languages = Object.entries(langMap)
        .map(([lang, count]) => ({ lang, percentage: Math.round((count / data.length) * 100) }))
        .sort((a, b) => b.percentage - a.percentage);

      result = {
        totalRepos: data.length,
        totalStars,
        languages
      };
    } else if (mode === 'activity') {
      const res = await fetch(`https://api.github.com/users/${username}/events?per_page=10`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!res.ok) throw new Error("Rate limit or activity not found");
      const data = await res.json();
      
      // Extract commit events
      result = data
        .filter(e => e.type === 'PushEvent')
        .slice(0, 5)
        .map(e => ({
          repo: e.repo.name.replace(`${username}/`, ''),
          commits: e.payload.commits ? e.payload.commits.map(c => c.message) : [],
          date: new Date(e.created_at).toLocaleDateString()
        }));
    }
    
    setCachedData(CACHE_KEY, result);
    return result;
  } catch (err) {
    console.warn(`GitHub API [${mode}] failed. Using local fallback cache.`, err);
    return getGithubFallback(mode);
  }
}

function getGithubFallback(mode) {
  const fallbacks = {
    user: {
      username: "RAZAAli901",
      name: "Raza Ali Murtaza",
      publicRepos: 18,
      followers: 12,
      location: "Lahore, Pakistan",
      bio: "AI/ML Engineer & Full-Stack Developer"
    },
    repos: [
      { name: "Interactive-Terminal-Portfoil", stars: 15, forks: 3, language: "JavaScript", url: "https://github.com/RAZAAli901/Interactive-Terminal-Portfoil" },
      { name: "Enterprise-RAG-Pipeline", stars: 42, forks: 12, language: "Python", url: "https://github.com/RAZAAli901/Enterprise-RAG-Pipeline" },
      { name: "Typing-Speed-Tester", stars: 8, forks: 1, language: "C++", url: "https://github.com/RAZAAli901/Typing-Speed-Tester" }
    ],
    stats: {
      totalRepos: 18,
      totalStars: 65,
      languages: [
        { lang: "Python", percentage: 55 },
        { lang: "JavaScript", percentage: 30 },
        { lang: "C++", percentage: 10 },
        { lang: "SQL", percentage: 5 }
      ]
    },
    activity: [
      { repo: "Interactive-Terminal-Portfoil", commits: ["docs: Update README.md with upgraded features", "style: Clean up formatting"], date: "2026-06-25" },
      { repo: "Enterprise-RAG-Pipeline", commits: ["feat: optimize FAISS retriever index matching", "docs: update API setup docs"], date: "2026-03-10" }
    ]
  };
  return fallbacks[mode];
}

/**
 * Returns answers in first person as Raza Ali Murtaza.
 * @param {string} query 
 * @returns {string[]} Response text broken down by lines
 */
export function getClaudeResponse(query) {
  const clean = query.toLowerCase().trim();
  
  if (clean.includes('favorite project') || clean.includes('best project') || clean.includes('coolest project')) {
    return [
      "My favorite project is definitely the Enterprise RAG Pipeline.",
      "I built it using Python, LangChain, and FAISS to search through gigabytes of document logs.",
      "What made it rewarding was optimizing the retriever index to cut search latency by 35% while keeping precision high.",
      "Close second is this OS Terminal Portfolio, which was just pure fun to build in React!"
    ];
  }
  
  if (clean.includes('different') || clean.includes('why hire') || clean.includes('unique') || clean.includes('special')) {
    return [
      "What makes me different is the bridge I build between AI modeling and full-stack execution.",
      "Many ML engineers just work in Jupyter Notebooks, and many frontend devs don't understand embeddings.",
      "I build the complete stack: from custom YOLO model fine-tuning and LangChain vector stores to responsive React UI frames.",
      "This means faster prototypes, fewer communication bottlenecks, and production-ready code."
    ];
  }
  
  if (clean.includes('rag') || clean.includes('retrieval') || clean.includes('vector') || clean.includes('faiss') || clean.includes('chromadb')) {
    return [
      "Retrieval-Augmented Generation (RAG) is a technique to supply external document contexts to LLMs.",
      "In my projects, I use LangChain to chunk unstructured text, Hugging Face to generate vector embeddings,",
      "and FAISS or ChromaDB to index those embeddings for high-speed similarity lookups.",
      "This lets the AI answer user questions with up-to-date, specialized knowledge, drastically reducing hallucinations."
    ];
  }

  if (clean.includes('stack') || clean.includes('technolog') || clean.includes('skill') || clean.includes('language') || clean.includes('code')) {
    return [
      "My primary development stack includes:",
      "• Core Languages : Python, JavaScript/TypeScript, C++, and SQL.",
      "• Artificial Intelligence: LangChain, FAISS, YOLO object detection, OpenCV, and PyTorch.",
      "• Web Engineering  : React 19, Vite, Node.js, Express, FastAPI, and TailwindCSS.",
      "• Data Systems      : MongoDB, PostgreSQL, SQLite, and ChromaDB.",
      "I am currently focusing on building self-corrective RAG agents and complex browser UIs."
    ];
  }

  if (clean.includes('experience') || clean.includes('work') || clean.includes('history') || clean.includes('job') || clean.includes('career')) {
    return [
      "I have worked across a few key areas in tech:",
      "1. Smart Logics LLC (AI/ML Engineer): Building production-grade LangChain/RAG pipelines, caching systems, and FastAPI servers.",
      "2. Ideas Animation Studio (CV Engineer): Fine-tuning YOLO models for real-time video tracking and OpenCV filters.",
      "3. Arrivy (Frontend / MERN Developer): Creating dashboards, optimizing React pages, and caching assets.",
      "I'm always open to new freelance or full-time opportunities where AI meets frontend!"
    ];
  }

  if (clean.includes('contact') || clean.includes('email') || clean.includes('reach') || clean.includes('social')) {
    return [
      "You can reach out to me directly at:",
      "• Email    : razaalymurtaza@gmail.com",
      "• LinkedIn : linkedin.com/in/razaali",
      "• GitHub   : github.com/RAZAAli901",
      "Or type 'contact --send' right here in the terminal to compose a message!"
    ];
  }
  
  // Default fallback answer
  return [
    "I am Raza's AI assistant. I can answer questions authentically in the first person about:",
    "• Raza's favorite project or RAG systems",
    "• What makes him unique as an engineer",
    "• His work experience and tech stack",
    "• How to contact him",
    "Ask me something like: 'ask what makes you different as an engineer?'"
  ];
}
