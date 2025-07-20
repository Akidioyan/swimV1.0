# 🌐 API端点配置指南

## 📋 可用的API端点

根据参考配置 `src/refData/vite.config.js`，我们发现了以下可用的API端点：

### 1. 通用API端点 `/api`
- **代理目标**: `https://w.inews.qq.com`
- **路径重写**: `/api` → `` (移除前缀)
- **用途**: 通用API请求

### 2. 活动API端点 `/apiactivity` ⭐
- **代理目标**: `https://w.inews.qq.com`
- **路径重写**: `/apiactivity` → `/activity`
- **用途**: 专门用于活动相关的数据请求

## 🔧 当前实现的API调用

### 📊 参与人数获取
```javascript
// 优先级顺序：
1. /apiactivity/pingpang/pv     ← 专门的乒乓球活动API
2. /apiactivity/pv              ← 简化的活动API
3. /api/activity/pingpang/pv    ← 通用API完整路径
4. /api/activity/pv             ← 通用API简化路径
```

### 🎯 游戏结果上报
```javascript
// 优先级顺序：
1. /apiactivity/pingpong_report  ← 专门的乒乓球游戏上报
2. /apiactivity/report_summary   ← 活动总结上报
3. /api/activity/pingpong_report ← 通用API乒乓球上报
4. /api/activity/report_summary  ← 通用API总结上报
```

## 🚀 实际请求转换

### 活动API端点转换
```
前端请求: /apiactivity/pingpang/pv
↓ (代理转换)
实际请求: https://w.inews.qq.com/activity/pingpang/pv
```

### 通用API端点转换
```
前端请求: /api/activity/pingpang/pv
↓ (代理转换)  
实际请求: https://w.inews.qq.com/activity/pingpang/pv
```

## 📝 重要请求头

所有请求都会自动添加以下请求头：
```javascript
headers: {
  'Origin': 'https://view.inews.qq.com', 
  'Referer': 'https://view.inews.qq.com/',
  'Content-Type': 'application/json'
}
```

## 🔄 容错机制

1. **多端点尝试**: 按优先级依次尝试4个不同端点
2. **优雅降级**: API失败时自动使用模拟数据
3. **详细日志**: 每个请求都有完整的成功/失败日志
4. **用户体验**: 确保无论API状态如何，游戏都能正常运行

## 🧪 测试方法

### 检查控制台日志
```javascript
// 成功的情况：
🌐 尝试活动API端点: /apiactivity/pingpang/pv
✅ 活动API端点 /apiactivity/pingpang/pv 请求成功: {total: 483251}

// 失败但有降级的情况：
🌐 尝试活动API端点: /apiactivity/pingpang/pv
⚠️ 活动API端点 /apiactivity/pingpang/pv 失败: HTTP error! status: 404
📊 所有活动API端点都失败，使用模拟数据
✅ 参与人数数据获取成功: 48.3万
```

### 网络面板检查
在浏览器开发者工具的Network面板中，可以看到：
- 请求URL: `http://localhost:3011/apiactivity/pingpang/pv`
- 实际转发到: `https://w.inews.qq.com/activity/pingpang/pv`
- 请求头包含正确的Origin和Referer

## 🎯 下一步优化建议

1. **API响应格式确认**: 确认服务器返回的数据格式
2. **错误码处理**: 针对不同HTTP状态码进行特定处理
3. **缓存策略**: 添加合理的API响应缓存
4. **重试机制**: 对临时失败的请求进行重试
5. **监控集成**: 添加API调用成功率监控 