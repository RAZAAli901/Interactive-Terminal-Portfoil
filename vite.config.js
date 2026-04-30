import { defineConfig } from 'vite'
import react from '@vitejs/react'

export default defineConfig({
  plugins: [react()],
  base: "/Interactive-Terminal-Portfoil/", // Add this line!
})
