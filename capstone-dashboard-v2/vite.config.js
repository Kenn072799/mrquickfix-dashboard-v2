import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {target: 'http://localhost:5000'}
    }
  },
  css: {
    postcss: {
      config: './capstone-dashboard-v2/postcss.config.js',
    }
  }
})