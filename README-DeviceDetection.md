# 📱 设备检测弹窗组件

根据Figma设计稿复原的设备检测弹窗Vue组件，用于检测用户设备兼容性并提供友好的用户体验。

## 🎨 设计特点

- **完全还原Figma设计**：精确还原设计稿中的视觉效果
- **响应式设计**：适配不同屏幕尺寸
- **现代化交互**：流畅的动画效果和悬停状态
- **无障碍支持**：符合Web可访问性标准

## 📂 文件结构

```
src/
├── components/
│   ├── DeviceDetectionModal.vue    # 主弹窗组件
│   └── DeviceDetectionTest.vue     # 测试页面
├── utils/
│   └── deviceDetection.js          # 设备检测工具
└── assets/
    └── device-detection-modal/
        └── Frame 18-x1.png         # 设计稿参考
```

## 🚀 使用方法

### 1. 基础使用

```vue
<template>
  <div>
    <!-- 其他内容 -->
    
    <DeviceDetectionModal 
      :visible="showModal"
      :allowBackdropClose="false"
      @close="handleClose"
      @action="handleAction"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DeviceDetectionModal from './components/DeviceDetectionModal.vue'

const showModal = ref(false)

const handleClose = () => {
  showModal.value = false
}

const handleAction = () => {
  // 处理用户点击"进入体育频道"按钮
  window.open('https://sports.qq.com/', '_blank')
}
</script>
```

### 2. 集成设备检测

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { 
  checkDeviceCompatibility, 
  registerDeviceDetectionCallbacks,
  initDeviceDetectionListener 
} from './utils/deviceDetection'
import DeviceDetectionModal from './components/DeviceDetectionModal.vue'

const showDeviceModal = ref(false)

onMounted(() => {
  // 注册回调函数
  registerDeviceDetectionCallbacks({
    onShowModal: (type) => {
      showDeviceModal.value = true
    },
    onHideModal: () => {
      showDeviceModal.value = false
    },
    onAction: () => {
      window.open('https://sports.qq.com/', '_blank')
    }
  })
  
  // 初始化监听器
  initDeviceDetectionListener()
  
  // 检查设备兼容性
  checkDeviceCompatibility()
})
</script>
```

## 🔧 API 参考

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `Boolean` | `false` | 控制弹窗显示/隐藏 |
| `allowBackdropClose` | `Boolean` | `false` | 是否允许点击背景关闭弹窗 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `close` | - | 弹窗关闭时触发 |
| `action` | - | 点击"进入体育频道"按钮时触发 |

### 设备检测工具函数

| 函数 | 返回值 | 说明 |
|------|--------|------|
| `getDeviceType()` | `String` | 获取设备类型：'portrait', 'landscape', 'desktop' |
| `isPortraitMode()` | `Boolean` | 检测是否为竖屏模式 |
| `isTouchDevice()` | `Boolean` | 检测是否为触摸设备 |
| `checkDeviceCompatibility()` | `Boolean` | 检查设备兼容性并自动显示弹窗 |
| `registerDeviceDetectionCallbacks(callbacks)` | - | 注册设备检测回调函数 |
| `initDeviceDetectionListener()` | - | 初始化设备检测监听器 |

## 🎛️ 样式定制

组件使用了CSS自定义属性，可以通过覆盖CSS变量来定制样式：

```css
.device-detection-modal {
  --modal-bg-color: rgb(32, 32, 32);
  --modal-border-color: rgb(13, 113, 237);
  --header-bg-color: rgb(11, 106, 234);
  --text-color-primary: rgb(231, 231, 231);
  --text-color-secondary: rgb(218, 218, 218);
  --button-color: rgb(11, 106, 234);
}
```

## 📱 响应式设计

组件已实现完整的响应式设计：

- **桌面端**：原始尺寸 336×226px
- **平板端**：90% 宽度，最大 336px
- **手机端**：适配小屏幕的字体和间距

## 🧪 测试

使用测试组件验证弹窗效果：

```vue
<DeviceDetectionTest />
```

测试组件提供了：
- 手动触发弹窗显示
- 实时设备信息显示
- 设计稿对比参考

## 🌟 特色功能

### 1. 精确还原设计

- 完全按照Figma设计稿的尺寸、颜色、字体实现
- 特殊的横幅形状使用CSS clip-path实现
- 按钮图标使用CSS伪元素绘制

### 2. 智能设备检测

- 自动检测设备类型（桌面/移动/平板）
- 监听屏幕方向变化
- 防抖处理避免频繁触发

### 3. 用户体验优化

- 流畅的弹窗动画效果
- 悬停和点击状态反馈
- 键盘导航支持
- 无障碍功能完整

## 🔄 迁移指南

从旧版设备检测迁移到新组件：

### 旧版使用方式
```javascript
import { showDesktopUnsupportedMessage } from './utils/deviceDetection'
showDesktopUnsupportedMessage()
```

### 新版使用方式
```javascript
import { registerDeviceDetectionCallbacks, checkDeviceCompatibility } from './utils/deviceDetection'

registerDeviceDetectionCallbacks({
  onShowModal: (type) => {
    // 显示Vue组件弹窗
  }
})

checkDeviceCompatibility()
```

## 📊 性能特点

- **轻量级**：纯CSS实现，无第三方依赖
- **高性能**：使用CSS transform和opacity动画
- **内存友好**：组件按需渲染，支持v-if控制
- **兼容性好**：支持现代浏览器和移动端

## 🛠️ 开发建议

1. **统一管理**：在App.vue中统一处理设备检测逻辑
2. **回调注册**：在应用初始化时注册所有回调函数
3. **错误处理**：为跳转操作添加try-catch错误处理
4. **用户体验**：避免在关键操作中频繁显示弹窗

## 📝 更新日志

### v1.0.0 (当前版本)
- ✅ 完整实现Figma设计稿
- ✅ Vue 3 Composition API支持
- ✅ 响应式设计
- ✅ 无障碍功能
- ✅ 设备检测集成
- ✅ 测试组件

---

**注意**：此组件专为游泳世锦赛互动小游戏项目设计，如需用于其他项目请根据实际需求调整样式和文案。 