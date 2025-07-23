<template>
  <div class="test-entry">
    <div class="test-entry-content">
      <h1>🧪 开发者测试入口</h1>
      
      <div class="test-links">
        <div class="test-link-card">
          <h3>EndingSceneApp 测试</h3>
          <p>测试端内APP结果页面组件</p>
          <button @click="enterAppTest" class="btn-test">
            进入测试
          </button>
        </div>
        
        <div class="test-link-card">
          <h3>EndingSceneOutside 测试</h3>
          <p>测试端外浏览器结果页面组件</p>
          <button @click="enterOutsideTest" class="btn-test">
            进入测试
          </button>
        </div>
        
        <div class="test-link-card">
          <h3>正常游戏流程</h3>
          <p>返回正常的游戏流程</p>
          <button @click="exitTestMode" class="btn-test btn-normal">
            退出测试
          </button>
        </div>
      </div>
      
      <div class="test-info">
        <h3>测试说明</h3>
        <ul>
          <li>EndingSceneApp测试：模拟端内APP环境，测试完整的50人排行榜</li>
          <li>EndingSceneOutside测试：模拟端外浏览器环境，测试简化排行榜</li>
          <li>可以通过URL参数 <code>?test=app</code> 或 <code>?test=outside</code> 直接进入测试</li>
          <li>测试数据会保存在localStorage中，刷新页面不会丢失</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('🚀 测试入口页面已加载')
})

// 进入EndingSceneApp测试
const enterAppTest = () => {
  localStorage.setItem('endingSceneTestMode', 'app')
  window.location.reload()
}

// 进入EndingSceneOutside测试
const enterOutsideTest = () => {
  localStorage.setItem('endingSceneTestMode', 'outside')
  window.location.reload()
}

// 退出测试模式
const exitTestMode = () => {
  localStorage.removeItem('endingSceneTestMode')
  window.location.href = window.location.pathname
}
</script>

<style scoped>
.test-entry {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
}

.test-entry-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
}

.test-entry-content h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
  font-size: 32px;
  font-weight: bold;
}

.test-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.test-link-card {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
}

.test-link-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 123, 255, 0.1);
}

.test-link-card h3 {
  color: #333;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
}

.test-link-card p {
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.5;
}

.btn-test {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
}

.btn-test:hover {
  background: #0056b3;
}

.btn-test.btn-normal {
  background: #28a745;
}

.btn-test.btn-normal:hover {
  background: #1e7e34;
}

.test-info {
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  padding: 20px;
}

.test-info h3 {
  color: #1976d2;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

.test-info ul {
  color: #424242;
  line-height: 1.6;
  margin: 0;
  padding-left: 20px;
}

.test-info li {
  margin-bottom: 8px;
}

.test-info code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: #d32f2f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-entry-content {
    padding: 20px;
  }
  
  .test-entry-content h1 {
    font-size: 24px;
  }
  
  .test-links {
    grid-template-columns: 1fr;
  }
}
</style> 