import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // Use GitHub Pages path ONLY if it's a production build AND NOT running on Vercel
  base: command === 'build' && !process.env.VERCEL ? "/Interactive-Terminal-Portfoil/" : "/",
  test: {
    // Vitest configuration
    globals: true,        // use describe/it/expect without imports
    environment: 'jsdom', // simulate DOM for React component tests
    setupFiles: ['./src/test/setup.js'],
  },
}))