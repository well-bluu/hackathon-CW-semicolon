import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// this configuration includes a development proxy for the local Ollama server
// so the frontend can call `/ollama/...` without CORS issues.
export default defineConfig({
  plugins: [react()],
  server: {
    // proxy requests starting with /ollama to the local Ollama server
    proxy: {
      '/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ''),
      },
    },
  },
})
