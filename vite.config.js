import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // 强制将所有代码合并成单个文件
        manualChunks: () => 'everything.js',
        // 自定义文件名格式
        entryFileNames: 'assets/js/[name].js',
        chunkFileNames: 'assets/js/[name].js',
        assetFileNames: (assetInfo) => {
          // CSS文件
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name].[ext]'
          }
          // 其他资源文件
          return 'assets/[name].[ext]'
        }
      }
    },
    // 额外的构建优化选项
    cssCodeSplit: false, // 禁用CSS代码分割
    chunkSizeWarningLimit: 3000 // 增加chunk大小警告限制
  },
  server: {
    port: 3000,
    host: true,
    headers: {
      // 添加媒体文件的缓存头
      'Cache-Control': 'no-cache'
    },
    fs: {
      // 允许访问工作区外的文件
      strict: false
    },
    proxy: {
      // 通用API端点
      '/api': {
        target: 'https://dev.inews.qq.com',
        changeOrigin: true,
        rewrite: (p) => {
          return p.replace(/^\/api/, '')
        },
        headers: {
          'Origin': 'https://view.inews.qq.com', 
          'Referer': 'https://view.inews.qq.com/'
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      // 活动相关API端点（专门用于活动数据）
      '/apiactivity': {
        target: 'https://dev.inews.qq.com',
        changeOrigin: true,
        rewrite: (p) => {
          return p.replace(/^\/apiactivity/, '/activity')
        },
        headers: {
          'Origin': 'https://view.inews.qq.com', 
          'Referer': 'https://view.inews.qq.com/'
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('activity proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Activity Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Activity Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  publicDir: 'public',
  assetsInclude: ['**/*.mp4', '**/*.webm', '**/*.ogg'],
  optimizeDeps: {
    exclude: ['vue-demi']
  }
})