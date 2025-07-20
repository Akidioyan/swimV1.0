import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ command }) => {
  const config = {
    base: command === 'serve' ? '/' : '/pingpang/',
    plugins: [vue()],
    server: {
      host: '127.0.0.1',
      port: 5174,
      strictPort: true,
      open: true,
      cors: true,
      hmr: {
        host: '127.0.0.1',
        port: 5174
      },
      proxy: {
        '/api': {
          target: 'https://w.inews.qq.com',
          changeOrigin: true,
          rewrite: (p) => {
            return p.replace(/^\/api/, '')
          },
          headers: {
            'Origin': 'https://view.inews.qq.com', 
            'Referer': 'https://view.inews.qq.com/'
          }
        },
        '/apiactivity': {
          target: 'https://w.inews.qq.com',
          changeOrigin: true,
          rewrite: (p) => {
            return p.replace(/^\/apiactivity/, '/activity')
          },
          headers: {
            'Origin': 'https://view.inews.qq.com', 
            'Referer': 'https://view.inews.qq.com/'
          }
        }
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false
    },
    publicDir: 'public'
  }
  return config
})