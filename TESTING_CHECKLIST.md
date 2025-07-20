# 🧪 数据流测试清单

## ✅ 已确认正常工作的部分

1. **API URL修复成功** ✅
   - 不再有重复的 `/api` 前缀
   - 正确的URL: `/apiactivity/pingpang/pv`

2. **代理转发正常** ✅  
   - Vite正确将请求转发到 `https://w.inews.qq.com/activity/pingpang/pv`
   - 服务器返回404是预期的（测试环境）

## 🔍 请检查以下内容

### 1. 参与人数显示检查
请在浏览器中访问 `http://localhost:3013/` 并检查：

- [ ] **主页是否显示参与人数？**
  - 应该显示类似："—— 已有48.1万人参与过挑战 ——"
  - 每次刷新页面，数字应该有小幅变化

### 2. 控制台日志检查
打开浏览器开发者工具的Console面板，应该看到：

```javascript
✅ 期望的成功日志：
🎮 IntroView 组件挂载，开始获取参与人数数据...
🌐 尝试活动API端点: /apiactivity/pingpang/pv
🌐 发起API请求: /apiactivity/pingpang/pv
❌ API请求失败: /apiactivity/pingpang/pv Error: HTTP error! status: 404
🌐 尝试活动API端点: /apiactivity/pv
🌐 发起API请求: /apiactivity/pv
❌ API请求失败: /apiactivity/pv Error: HTTP error! status: 404
🌐 尝试活动API端点: /api/activity/pingpang/pv
🌐 发起API请求: /api/activity/pingpang/pv
❌ API请求失败: /api/activity/pingpang/pv Error: HTTP error! status: 404
🌐 尝试活动API端点: /api/activity/pv
🌐 发起API请求: /api/activity/pv
❌ API请求失败: /api/activity/pv Error: HTTP error! status: 404
📊 所有活动API端点都失败，使用模拟数据
获取活动人数失败，使用默认值: Error: HTTP error! status: 404
活动参与人数更新成功: 483251
✅ 参与人数数据获取成功: 48.3万
```

### 3. 网络请求检查
在开发者工具的Network面板中：

- [ ] 可以看到4个API请求（对应4个端点）
- [ ] 所有请求都返回404状态码
- [ ] 请求头包含正确的Origin和Referer

### 4. 游戏数据上报测试
- [ ] 开始一局游戏
- [ ] 故意失败结束游戏  
- [ ] 检查控制台是否有游戏数据上报的日志

## 🎯 如果出现问题

### 参与人数不显示
如果参与人数显示为固定的"481,151"，说明：
- API请求可能没有触发
- 或者降级数据没有正确返回

### 控制台没有相关日志
如果看不到API请求日志：
- 检查是否在正确的页面（IntroView）
- 尝试刷新页面重新触发请求

### 游戏数据上报失败
如果游戏结束时没有上报日志：
- 检查gameState.js中的gameOver方法
- 确认是否正确导入了gameStore

## 🚀 验证成功标志

如果看到以下情况，说明数据流完全正常：

1. **参与人数动态更新** - 每次刷新有微小变化
2. **降级机制正常** - API失败后使用模拟数据
3. **游戏数据上报** - 游戏结束时有上报日志
4. **URL格式正确** - 不再有重复的前缀

## 📞 需要帮助？

如果遇到问题，请提供以下信息：
1. 浏览器控制台的完整日志
2. 参与人数是否正常显示
3. Network面板中的请求详情 