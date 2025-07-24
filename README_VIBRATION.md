# 🎮 游戏震动功能说明

## 功能概述

游戏现已支持手机震动反馈功能，为不同的游戏事件提供不同强度的震动体验，提升游戏沉浸感。**震动功能会自动跟随音频状态变化**，提供一致的用户体验。

## 震动类型

### ⭐ 轻微震动 (收集星星)
- **触发场景**: 玩家收集到星星道具时
- **震动强度**: 50毫秒的轻快震动
- **作用**: 提供愉悦的收集反馈

### 🏊‍♀️ 中等震动 (收集道具) 
- **触发场景**: 玩家收集到呼吸管道具时
- **震动强度**: 80毫秒的中等震动
- **作用**: 强调道具收集的重要性

### 💥 重度震动 (碰撞障碍物)
- **触发场景**: 玩家碰撞到障碍物失去生命时
- **震动强度**: 100ms震动 + 50ms停止 + 100ms震动
- **作用**: 警示玩家发生危险事件

### 🎮 游戏结束震动
- **触发场景**: 游戏结束时
- **震动强度**: 200ms震动 + 100ms停止 + 200ms震动 + 100ms停止 + 200ms震动
- **作用**: 标志游戏结束的重要时刻

## 🔊 音频同步功能

### 自动同步规则
震动功能会自动跟随音频状态，确保体验一致性：

1. **🔊 音频开启时** → 震动自动启用
2. **🔇 音频关闭/静音时** → 震动自动禁用  
3. **🎚️ 音量调至最小时** → 震动自动禁用
4. **🎵 音乐暂停时** → 震动自动禁用

### 检测机制
- **音频状态监听**: 实时监听音乐和音效开关状态
- **音量变化检测**: 监听主音量变化
- **音频上下文监听**: 检测系统级音频状态
- **页面可见性检测**: 监听页面状态变化

### 手动控制
用户可以在开发者调试面板中手动控制震动：
- **手动启用**: 覆盖音频同步，强制启用震动
- **手动禁用**: 覆盖音频同步，强制禁用震动
- **恢复自动**: 重新启用音频状态同步

## 技术实现

### 兼容性检测
- 自动检测设备是否支持震动功能
- 使用 `navigator.vibrate()` API
- 在不支持的设备上优雅降级

### 震动管理器 (`src/utils/vibration.js`)
```javascript
import vibrationManager from '@/utils/vibration.js'

// 检查支持状态
vibrationManager.isSupported

// 启用/禁用震动（手动控制）
vibrationManager.setEnabled(true/false, true)

// 与音频管理器同步
vibrationManager.syncWithAudioManager(audioManager)

// 不同类型的震动
vibrationManager.lightVibration()    // 轻微震动
vibrationManager.mediumVibration()   // 中等震动  
vibrationManager.heavyVibration()    // 重度震动
vibrationManager.gameOverVibration() // 游戏结束震动
```

### 音频管理器集成 (`src/utils/audio-manager.js`)
音频管理器现在会在状态变化时自动通知震动管理器：
```javascript
// 音频状态变化时自动同步震动
audioManager.toggleMusic()  // 自动同步震动状态
audioManager.toggleSound()  // 自动同步震动状态
audioManager.setMasterVolume(0.5) // 自动同步震动状态
```

### 集成位置

1. **星星收集** (`src/stores/gamestore/gameObjects.js`)
   ```javascript
   // 在 collectPowerUp 方法中
   if (powerUp.type === 'star') {
     vibrationManager.lightVibration()
     // ...其他逻辑
   }
   ```

2. **道具收集** (`src/stores/gamestore/gameObjects.js`)
   ```javascript
   // 在 collectPowerUp 方法中
   if (powerUp.type === 'snorkel') {
     vibrationManager.mediumVibration()
     // ...其他逻辑
   }
   ```

3. **障碍物碰撞** (`src/stores/gamestore/gameState.js`)
   ```javascript
   // 在 takeDamage 方法中
   takeDamage() {
     if (this.invulnerable) return false
     vibrationManager.heavyVibration()
     // ...其他逻辑
   }
   ```

4. **游戏结束** (`src/stores/gamestore/gameState.js`)
   ```javascript
   // 在 gameOver 方法中
   async gameOver() {
     vibrationManager.gameOverVibration()
     // ...其他逻辑
   }
   ```

## 开发者调试

在开发者调试面板 (按 `L` 键打开) 中提供了震动功能测试：

- **震动支持检测**: 显示当前设备是否支持震动
- **音频同步状态**: 实时显示音频状态
- **震动开关**: 可以手动控制震动功能（覆盖音频同步）
- **单独测试**: 测试每种震动类型
- **全功能测试**: 按顺序测试所有震动类型
- **实时状态显示**: 显示震动功能的当前状态

## 用户体验

### 设计原则
1. **轻重有别**: 不同事件使用不同强度的震动
2. **正负分明**: 正面事件(收集)使用短促震动，负面事件(碰撞)使用强烈震动
3. **音频一致性**: 震动状态自动跟随音频状态，确保体验一致
4. **优雅降级**: 在不支持震动的设备上不影响游戏体验
5. **用户控制**: 提供手动控制选项

### 震动模式说明
- **单次震动**: 用于瞬间反馈 (收集星星/道具)
- **双重震动**: 用于警示 (碰撞障碍物)
- **三重震动**: 用于重要事件 (游戏结束)

### 音频同步体验
- **静音时无震动**: 当用户静音设备时，震动也会停止
- **音量为0时无震动**: 当音量调至最小时，震动也会禁用
- **音频恢复时自动启用**: 当音频重新开启时，震动会自动恢复

## 浏览器支持

- ✅ **Chrome/Edge**: 完全支持
- ✅ **Firefox**: 完全支持  
- ✅ **Safari**: 部分支持 (需要用户手势激活)
- ✅ **移动端浏览器**: 大部分支持

> **注意**: 某些浏览器可能需要用户首次交互后才能启用震动功能。

## 性能影响

震动功能对游戏性能影响极小：
- 不占用额外内存
- 震动调用是异步的，不阻塞游戏循环
- 在不支持的设备上直接跳过，无性能损耗
- 音频状态监听使用低频率检查，对性能影响微乎其微

## 调试日志

震动功能会输出详细的控制台日志，方便开发调试：
```
🔗 音频管理器已连接震动管理器
震动状态已与音频同步: 启用 (音频启用: true, 音量: 1)
⭐ 收集星星，触发轻微震动
震动执行: 50ms
💥 碰撞障碍物，触发重度震动  
震动执行: 100,50,100ms
震动状态已自动同步: 禁用 (音频状态: 暂停, 静音: false)
``` 

## 常见问题

### Q: 为什么我关闭音量后震动还在工作？
A: 确保您使用的是最新版本的代码。新版本会自动检测音频状态并同步震动。

### Q: 如何完全禁用震动功能？
A: 在开发者调试面板中取消勾选"手动控制震动"选项，或直接在代码中调用 `vibrationManager.setEnabled(false, true)`。

### Q: 音频同步检测的延迟是多少？
A: 音频状态变化会立即同步震动状态，同时每500-1000ms进行一次状态检查确保同步。 