# Interactive Terminal OS Portfolio

<p align="center">
  <a href="https://razaali901.github.io/Interactive-Terminal-Portfoil/" target="_blank">
    <img src="https://img.shields.io/badge/LAUNCH_PORTFOLIO-Interactive_Terminal-00e676?style=for-the-badge&logo=visual-studio-code&logoColor=white" height="45">
  </a>
</p>

<p align="center">
  <i>A fully interactive, web-based operating system portfolio featuring a Windows-style UI, terminal, and custom applications.</i>
</p>

---

## 📸 Screenshots
*(Add screenshots here)*
- `Desktop View` - Showing the main desktop environment with taskbar and widgets.
- `Terminal Experience` - Highlighting the custom interactive terminal.
- `App Suite` - Displaying the Office suite, VS Code emulator, and games.

## ✨ Features

- **Custom Interactive Terminal**: Full command-line experience with auto-complete, history navigation (up/down arrows), and a rich set of commands (`about`, `projects`, `skills`, `theme`, etc.).
- **Window Management System**: Draggable, resizable, and minimizable windows with accurate z-index stacking.
- **Rich Application Suite**:
  - **VS Code Emulator**: View project files directly in a Monaco-based editor interface.
  - **Office Suite**: Simulated Word, Excel, PowerPoint, and OneNote applications.
  - **Web Browser & Chat**: Fully functional simulated browser and a mockup chat interface.
  - **Games**: Classic Minesweeper, Solitaire, and a Chrome-style Dinosaur game.
- **Dynamic Theming**: Support for multiple themes (Dracula, Nord, Monokai, Matrix, Cyberpunk, Retro) and 12 different wallpapers.
- **AI Assistant & RAG Parser**: Interactively parses queries regarding project implementations.
- **Responsive Design**: Adapts beautifully to mobile devices, defaulting to a focused terminal experience on small screens.
- **Performance Optimized**: Uses React `lazy` and `Suspense` for bundle splitting and dynamic imports.

## 🛠️ Technology Stack

- **Core**: React 19, JavaScript (ES6+), HTML5, CSS3 (CSS Modules)
- **Build Tool**: Vite
- **Testing**: Vitest, React Testing Library
- **Icons & UI**: Boxicons, Lucide React
- **Deployment**: GitHub Pages (or Vercel/Netlify)

## 🚀 Quick Setup

To run this project locally, ensure you have Node.js installed, then follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RAZAAli901/Interactive-Terminal-Portfoil.git
   cd Interactive-Terminal-Portfoil
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Run tests:**
   ```bash
   npm run test
   ```

## 🖥️ Terminal Commands    

Interact with the portfolio using these built-in commands inside the Terminal application:

| Command | Description |
| :--- | :--- |
| `about` | Display info about the developer |
| `projects` | View portfolio projects |
| `contact` | View contact information |
| `skills` | Render a styled ASCII bar chart of core technology skills |
| `theme [name]`| Switch color schemes (`dracula`, `nord`, `monokai`, `retro`, etc.) |
| `wallpaper [1-12]` | Change the desktop background |
| `ask [query]` | Query the integrated AI assistant |
| `github` | Fetch live repository stats over the GitHub API |
| `sudo` | Elevate session to Admin mode |
| `clear` | Clear the terminal screen |

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/RAZAAli901/Interactive-Terminal-Portfoil/issues).

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
