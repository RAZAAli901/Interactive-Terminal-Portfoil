import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // production only: GitHub Pages base path — dev uses "/" so localhost:5173 works correctly
  // In dev mode, serve from root so localhost:5173 works correctly
  base: command === 'build' ? "/Interactive-Terminal-Portfoil/" : "/",
  test: {
    // Vitest configuration
    globals: true,        // use describe/it/expect without imports
    environment: 'jsdom', // simulate DOM for React component tests
    setupFiles: ['./src/test/setup.js'],
  },
}))
