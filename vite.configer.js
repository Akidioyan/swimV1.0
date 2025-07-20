import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => {
  const config = {
    base: command === 'serve' ? '/' : '/',
    plugins: [vue()],
    server: {
      host: '127.0.0.1',
      port: 3000,
      strictPort: false,
      open: true,
      cors: true,
      hmr: {
        host: '127.0.0.1',
        port: 3000
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
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // 将所有模块打包到一个文件中
            return 'index';
          }
        }
      }
    },
    publicDir: 'public'
  }
  return config
}) 