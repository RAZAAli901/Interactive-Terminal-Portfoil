import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // Only apply the subfolder base during production build (GitHub Pages)
  // In dev mode, serve from root so localhost:5173 works correctly
  base: command === 'build' ? "/Interactive-Terminal-Portfoil/" : "/",
}))
