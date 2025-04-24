import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/B1Plus_English_Quiz_WebSite/',
  build: {
    outDir: 'dist',
  }
})
