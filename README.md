# 🏊‍♂️ 指尖游泳 - 游泳英雄挑战赛

一款基于Vue 3和HTML5 Canvas开发的2D横版游泳游戏，玩家控制游泳者在水中前进，躲避障碍物，收集道具，挑战更远的距离。

## 🎮 游戏特色

- **流畅的游泳体验**: 真实的水中游泳感觉
- **智能障碍物系统**: 动态生成多种类型障碍物
- **道具收集**: 呼吸管、护盾等特殊道具
- **成就系统**: 多种成就等待解锁
- **排行榜竞技**: 与其他玩家比拼距离
- **主动冲刺**: 玩家可控制的冲刺系统
- **护盾、收集道具的特效动画**
- **响应式设计**: 适配各种屏幕尺寸

## 🛠️ 技术特性

- **Vue 3 + Composition API**: 现代化的Vue开发方式
- **Pinia状态管理**: 统一管理游戏状态
- **HTML5 Canvas**: 高性能2D游戏渲染
- **响应式设计**: 支持桌面端和移动端
- **触摸控制**: 完整的移动端触摸支持
- **键盘快捷键**: 空格键、ESC、R、M、S等快捷操作

## 📋 环境要求

- Node.js 16+
- 现代浏览器（支持HTML5 Canvas）

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
游戏将在 http://localhost:3000 启动

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 🎯 游戏操作

### 桌面端
- **空格键**: 切换泳道
- **鼠标点击**: 切换泳道
- **ESC键**: 暂停/继续游戏
- **R键**: 重新开始（游戏结束时）
- **M键**: 切换音乐开关
- **S键**: 切换音效开关
- **长按空格键**: 主动冲刺

### 移动端
- **点击屏幕**: 切换泳道
- **长按玩家角色**: 主动冲刺（松开停止）
- **上滑**: 道具冲刺（消耗道具）
- **下滑**: 减速
- **触摸UI按钮**: 暂停、返回菜单等操作

## 📁 项目结构

```
src/
├── App.vue              # 根组件
├── main.js              # 应用入口
├── components/          # Vue组件
│   ├── LoadingView.vue  # 加载页面
│   ├── IntroView.vue    # 游戏介绍页
│   ├── GameView.vue     # 游戏主视图
│   └── ResultView.vue   # 结果页面
├── stores/              # 状态管理
│   └── gameStore.js     # 游戏状态存储
├── utils/               # 工具函数
│   ├── obstacles/       # 障碍物系统
│   │   ├── obstacleConfig.js    # 障碍物配置
│   │   ├── Obstacle.js          # 障碍物类
│   │   └── ObstacleManager.js   # 障碍物管理器
│   └── collisionDetection.js   # 碰撞检测工具
└── styles/
    └── global.css       # 全局样式表
```

## 🎨 游戏资源

游戏使用CSS绘制简单图形作为占位符，您可以替换为以下类型的素材：

### 角色动画 (/public/media/graphics/animations/swimmer/)
- 游泳者的各部位动画帧
- 头部、躯干、手臂、腿部分离资源
- 支持不同颜色变体

### 障碍物 (/public/media/graphics/obs/)
- obs1.png - 岩石
- obs2.png - 海草  
- obs3.png - 水母

### 道具
- snorkel.png / snorkel-glow.png - 呼吸管
- shield.png / shield-glow.png - 护盾

### UI元素
- 各种按钮、弹窗背景
- 进度条、加载动画
- 音乐/音效控制图标

## 🎵 音频支持

游戏预留了音频接口，可添加：
- 背景音乐
- 切换泳道音效
- 收集道具音效
- 碰撞音效
- UI交互音效

## 🏆 成就系统

游戏内置多种成就：
- **千分达人**: 达到1000分
- **五千高手**: 达到5000分
- **万分大师**: 达到10000分
- **百米泳者**: 游泳100米
- **长距离游泳者**: 游泳500米
- **海洋征服者**: 游泳1000米
- **速度之王**: 达到2倍速度
- **新纪录保持者**: 刷新个人最佳

## 📱 移动端优化

- 触摸操作优化
- 屏幕适配
- 性能优化
- 电池友好

## 🔧 自定义配置

### 游戏难度
在 `src/utils/obstacles/obstacleConfig.js` 中调整：
- 障碍物生成频率
- 障碍物类型配置
- 难度增长曲线
- 多重障碍物生成概率

### 障碍物行为
在 `src/utils/obstacles/Obstacle.js` 中修改：
- 障碍物移动逻辑
- 碰撞检测
- 自定义障碍物行为

### 视觉效果
在 `src/styles/global.css` 中修改：
- 颜色主题
- 动画效果
- 响应式断点

### 游戏机制
在 `src/stores/gameStore.js` 中调整：
- 游戏速度
- 分数计算
- 道具效果

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 支持

如有问题请创建Issue或联系开发者。

## 主动冲刺功能

### 控制方式
- **PC端**: 长按空格键进行主动冲刺
- **移动端**: 长按玩家角色进行主动冲刺，松开停止

### 功能特点
1. **主动冲刺**: 玩家可以主动控制冲刺，消耗冲刺能量
2. **无无敌状态**: 主动冲刺时没有无敌状态，仍可能撞到障碍物
3. **位置变化**: 冲刺时玩家位置向前移动（从屏幕80%位置移动到65%位置）
4. **能量系统**: 
   - 冲刺能量满值100%
   - 冲刺时每帧消耗2点能量
   - 不冲刺时每帧恢复0.5点能量
   - 能量耗尽时自动停止冲刺
5. **速度加成**: 主动冲刺时速度为正常速度的2.5倍
6. **UI显示**: 屏幕底部显示冲刺能量条，冲刺时有特殊指示器

### 与道具冲刺的区别
- **道具冲刺**: 获得snorkel道具后的3秒无敌冲刺（上滑触发）
- **主动冲刺**: 玩家主动控制的冲刺，消耗能量，无无敌状态（长按玩家角色）

### 游戏机制
- 主动冲刺和道具冲刺不能同时进行
- 冲刺完毕后玩家位置自动回到正常位置（屏幕80%）
- 移动端长按玩家角色即可开始冲刺，松开立即停止

---

🏊‍♂️ **开始你的游泳英雄之旅吧！** 🏊‍♀️