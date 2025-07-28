import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/global.css'

// vConsole调试工具初始化
const initVConsole = async () => {
  // 检查是否需要启用vConsole
  const shouldEnableVConsole = 
    import.meta.env.DEV || // 开发环境
    new URLSearchParams(window.location.search).has('debug') || // URL参数 ?debug
    new URLSearchParams(window.location.search).has('vconsole') || // URL参数 ?vconsole  
    localStorage.getItem('vconsole-enabled') === 'true' // localStorage标记

  if (shouldEnableVConsole) {
    try {
      const VConsole = (await import('vconsole')).default
      const vConsole = new VConsole({
        defaultPlugins: ['system', 'network', 'element', 'storage'],
        theme: 'dark'
      })
      
      console.log('🔧 vConsole调试工具已启用')
      console.log('📱 在移动设备上可查看console日志、网络请求等调试信息')
      
      // 添加自定义命令
      window.enableVConsole = () => {
        localStorage.setItem('vconsole-enabled', 'true')
        console.log('✅ vConsole已设置为持久启用，刷新页面生效')
      }
      
      window.disableVConsole = () => {
        localStorage.removeItem('vconsole-enabled')
        console.log('❌ vConsole已设置为禁用，刷新页面生效')
      }
      
      // 输出启用方式说明
      console.log('💡 vConsole启用方式:')
      console.log('  1. URL参数: ?debug 或 ?vconsole')
      console.log('  2. 控制台命令: enableVConsole() / disableVConsole()')
      console.log('  3. 开发环境自动启用')
      
    } catch (error) {
      console.error('❌ vConsole加载失败:', error)
    }
  }
}

// 初始化vConsole
initVConsole()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app') 