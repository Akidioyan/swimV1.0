import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue'],
          gsap: ['gsap'],
          lottie: ['vue3-lottie']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  },
  publicDir: 'public'
})