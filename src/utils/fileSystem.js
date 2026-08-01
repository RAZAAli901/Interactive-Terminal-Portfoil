export const fileSystem = {
  name: 'My Computer',
  type: 'drive',
  children: [
    {
      name: 'Local Disk (C:)',
      type: 'drive',
      children: [
        {
          name: 'Portfolio',
          type: 'folder',
          children: [
            {
              name: 'Projects',
              type: 'folder',
              children: [
                { name: 'Interactive-Terminal-Portfolio', type: 'project', projectId: 'interactive-terminal-portfolio' },
                { name: 'Enterprise-RAG-Pipeline', type: 'project', projectId: 'enterprise-rag-pipeline' },
                { name: 'Typing-Speed-Tester', type: 'project', projectId: 'typing-speed-tester' }
              ]
            },
            { name: 'resume.pdf', type: 'file' },
            { name: 'about.txt', type: 'file' },
            { name: 'contact.txt', type: 'file' }
          ]
        }
      ]
    }
  ]
};

export const fsData = {
  "/": {
    type: "dir",
    name: "/",
    children: ["portfolio", ".config"]
  },
  "/.config": {
    type: "dir",
    name: ".config",
    hidden: true,
    children: ["hypr", "waybar"]
  },
  "/.config/hypr": {
    type: "dir",
    name: "hypr",
    children: ["hyprland.conf"]
  },
  "/.config/waybar": {
    type: "dir",
    name: "waybar",
    children: ["config.jsonc"]
  },
  // The real rice config, matching what this desktop actually implements.
  "/.config/hypr/hyprland.conf": {
    type: "file",
    name: "hyprland.conf",
    size: 1180,
    hidden: false,
    content: [
      "# ~/.config/hypr/hyprland.conf",
      "",
      "monitor = ,preferred,auto,1",
      "",
      "general {",
      "    gaps_in = 8",
      "    gaps_out = 12",
      "    border_size = 1",
      "    col.active_border = rgba(7aa2f7ee) rgba(bb9af7ee) 45deg",
      "    col.inactive_border = rgba(7aa2f729)",
      "    layout = dwindle",
      "}",
      "",
      "decoration {",
      "    rounding = 11",
      "    blur {",
      "        enabled = true",
      "        size = 16",
      "        passes = 2",
      "    }",
      "    drop_shadow = true",
      "    shadow_range = 58",
      "}",
      "",
      "animations {",
      "    enabled = true",
      "    bezier = pop, 0.05, 0.9, 0.1, 1.05",
      "    bezier = smooth, 0.16, 1, 0.3, 1",
      "    animation = windows, 1, 2, pop",
      "    animation = workspaces, 1, 3, smooth, slide",
      "}",
      "",
      "dwindle {",
      "    pseudotile = true",
      "    preserve_split = true",
      "}",
      "",
      "$mod = SUPER",
      "bind = $mod, D, exec, wofi --show drun",
      "bind = $mod, RETURN, exec, kitty",
      "bind = $mod, Q, killactive",
      "bind = $mod, M, movetoworkspacesilent, special",
      "bind = $mod, SPACE, togglefloating",
      "bind = $mod, J, cyclenext",
      "bind = $mod, K, cyclenext, prev",
      "bind = CTRL, grave, hyprexpo:expo, toggle",
      "bind = $mod, 1, workspace, 1",
      "bind = $mod SHIFT, 1, movetoworkspace, 1",
      "",
      "# window rules",
      "windowrulev2 = opacity 0.90 0.90, class:^(kitty)$",
      "windowrulev2 = float, class:^(gnome-calculator)$",
    ]
  },
  "/.config/waybar/config.jsonc": {
    type: "file",
    name: "config.jsonc",
    size: 460,
    hidden: false,
    content: [
      "// ~/.config/waybar/config.jsonc",
      "{",
      '  "layer": "top",',
      '  "position": "top",',
      '  "height": 40,',
      '  "modules-left": ["hyprland/workspaces", "custom/expo", "hyprland/window"],',
      '  "modules-center": ["clock"],',
      '  "modules-right": ["cpu", "memory", "temperature", "network", "pulseaudio", "battery", "custom/power"],',
      '  "clock": { "format": "{:%H:%M}", "format-alt": "{:%a %e %b}" },',
      '  "cpu": { "format": "CPU {usage}%" },',
      '  "memory": { "format": "RAM {}%" }',
      "}",
    ]
  },
  "/portfolio": {
    type: "dir",
    name: "portfolio",
    children: ["projects", "about", "contact", "experience", "resume.pdf", "portfolio.json"]
  },
  "/portfolio/projects": {
    type: "dir",
    name: "projects",
    children: ["Interactive-Terminal-Portfolio", "Enterprise-RAG-Pipeline", "Typing-Speed-Tester"]
  },
  "/portfolio/about": {
    type: "dir",
    name: "about",
    children: ["about.txt"]
  },
  "/portfolio/contact": {
    type: "dir",
    name: "contact",
    children: ["contact.txt"]
  },
  "/portfolio/experience": {
    type: "dir",
    name: "experience",
    children: ["experience.txt"]
  },
  "/portfolio/resume.pdf": {
    type: "file",
    name: "resume.pdf",
    size: 24512,
    hidden: false,
    content: [
      "===========================================================",
      "                 RAZA ALI - RESUME / CV                    ",
      "===========================================================",
      "AI/ML Engineer & Full-Stack Developer",
      "Lahore, Pakistan | razaalymurtaza@gmail.com",
      "",
      "--- SKILLS ---",
      "• Languages: Python, JavaScript, C++, SQL",
      "• ML/AI: LangChain, FAISS, RAG Pipelines, YOLO, OpenCV",
      "• Frontend: React, Vite, CSS Modules, Tailwind",
      "• Backend: Node.js, Express, MongoDB, FastAPI",
      "• Tools: Git, Docker, VS Code, Terminal",
      "",
      "--- EXPERIENCE ---",
      "• AI/ML Engineer | Smart Logics LLC (2023 - Present)",
      "  LangChain/RAG Pipelines, hybrid vector search optimizations.",
      "• CV Engineer | Ideas Animation Studio (2022 - 2023)",
      "  YOLO object detection, OpenCV image preprocessing.",
      "• Frontend Developer | Arrivy (2021 - 2022)",
      "  MERN Stack, dashboard interfaces, performance optimizations.",
      "",
      "--- EDUCATION ---",
      "• Bachelor of Science in Computer Science | FAST-NUCES (2024)",
      "",
      "Download full resume: download resume.pdf"
    ]
  },
  "/portfolio/portfolio.json": {
    type: "file",
    name: "portfolio.json",
    size: 4096,
    hidden: false,
    content: [
      "{",
      "  \"name\": \"Raza Ali Murtaza\",",
      "  \"role\": \"AI/ML Engineer\",",
      "  \"location\": \"Lahore, Pakistan\",",
      "  \"projectsCount\": 3,",
      "  \"stack\": [\"Python\", \"LangChain\", \"FAISS\", \"React\", \"C++\"]",
      "}"
    ]
  },
  "/portfolio/projects/Interactive-Terminal-Portfolio": {
    type: "file",
    name: "Interactive-Terminal-Portfolio",
    size: 2048,
    hidden: false,
    content: [
      "Interactive Terminal Portfolio",
      "-----------------------------",
      "Tech Stack: React, Vite, CSS Modules, TailwindCSS",
      "Status: Live",
      "Description: A simulated Windows-style desktop OS containing a retro command line interface.",
      "URL: https://github.com/RAZAAli901/Interactive-Terminal-Portfoil"
    ]
  },
  "/portfolio/projects/Enterprise-RAG-Pipeline": {
    type: "file",
    name: "Enterprise-RAG-Pipeline",
    size: 3072,
    hidden: false,
    content: [
      "Enterprise RAG Pipeline",
      "-----------------------",
      "Tech Stack: Python, LangChain, FAISS, FastAPI, ChromaDB",
      "Status: Production",
      "Description: End-to-end document parsing and hybrid vector retrieval system.",
      "URL: https://github.com/RAZAAli901/Enterprise-RAG-Pipeline"
    ]
  },
  "/portfolio/projects/Typing-Speed-Tester": {
    type: "file",
    name: "Typing-Speed-Tester",
    size: 1024,
    hidden: false,
    content: [
      "Typing Speed Test Engine",
      "------------------------",
      "Tech Stack: C++, CLI, Multithreading",
      "Status: Stable",
      "Description: Native console typing trainer with real-time statistics tracker.",
      "URL: https://github.com/RAZAAli901/Typing-Speed-Tester"
    ]
  },
  "/portfolio/about/about.txt": {
    type: "file",
    name: "about.txt",
    size: 512,
    hidden: false,
    content: [
      "I am an AI/ML Engineer and Full-Stack Developer located in Lahore, Pakistan.",
      "I build production-grade Retrieval-Augmented Generation (RAG) pipelines, semantic vector indexes, and interactive modern web applications.",
      "Current focus is on building AI integrations, custom vector stores, and custom CLI developer tool sets."
    ]
  },
  "/portfolio/contact/contact.txt": {
    type: "file",
    name: "contact.txt",
    size: 256,
    hidden: false,
    content: [
      "Email: razaalymurtaza@gmail.com",
      "LinkedIn: linkedin.com/in/razaali",
      "GitHub: github.com/RAZAAli901",
      "Twitter/X: @RAZAAli901",
      "Location: Lahore, Pakistan"
    ]
  },
  "/portfolio/experience/experience.txt": {
    type: "file",
    name: "experience.txt",
    size: 1024,
    hidden: false,
    content: [
      "1. Smart Logics LLC | AI/ML Engineer (2023-Present)",
      "   - Deployed scalable RAG systems with LangChain and vector databases.",
      "2. Ideas Animation Studio | CV Engineer (2022-2023)",
      "   - Built custom YOLO models and real-time vision pipelines.",
      "3. Arrivy | Frontend Developer (2021-2022)",
      "   - Built web dashboard designs and optimized MERN frontends."
    ]
  },
  "/portfolio/.hidden_secret": {
    type: "file",
    name: ".hidden_secret",
    size: 1337,
    hidden: true,
    content: [
      "🕵️ Congratulations! You found the hidden secret file.",
      "Here is a code word: 'antigravity-portfolio-master'"
    ]
  }
};

/**
 * Normalizes a path string, resolving '.' and '..' components
 * @param {string} path 
 * @returns {string} Normalized absolute path
 */
export function normalizePath(path) {
  const parts = path.split("/").filter(p => p !== "" && p !== ".");
  const stack = [];
  for (const part of parts) {
    if (part === "..") {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return "/" + stack.join("/");
}

/**
 * Resolves a target path relative to the current path
 * @param {string} currentPath 
 * @param {string} targetPath 
 * @returns {string} The resolved absolute path
 */
export function resolveAbsolutePath(currentPath, targetPath) {
  if (!targetPath) return currentPath;
  let fullPath = targetPath.startsWith("/") ? targetPath : `${currentPath}/${targetPath}`;
  
  // Clean trailing slash unless it's root
  const normalized = normalizePath(fullPath);
  return normalized;
}

/**
 * Checks if a path exists and returns its metadata
 * @param {string} path 
 * @returns {object|null}
 */
export function getFsItem(path) {
  const normalized = normalizePath(path);
  return fsData[normalized] || null;
}
