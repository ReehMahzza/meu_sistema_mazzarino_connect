// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Removemos a seção css aqui porque estamos usando CDN
  // e o postcss.config.js já lida com o PostCSS.
})