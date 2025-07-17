# 游泳项目企业云部署指南

## 项目结构
本项目已经过优化，适合在企业内部云环境中部署。

## 部署文件说明

### 1. index.html
- 已配置为生产环境版本
- 使用腾讯CDN加载静态资源（图标、图片等）
- 正确引用 `/assets/` 目录下的构建文件
- 集成了灯塔SDK用于数据统计

### 2. 构建文件（/assets/ 目录）
- `index-C7rYn7pW.css`: 主样式文件
- `vendor-CfQ3YXgO.js`: Vue框架及核心依赖
- `gsap-CH_iu5NA.js`: GSAP动画库
- `lottie-ChOBWohP.js`: Lottie动画库
- `index-CyTsUbM6.js`: 主应用代码

### 3. vercel.json
- 配置了SPA路由重写
- 设置了静态资源缓存策略
- 配置了正确的Content-Type头

## 部署步骤

1. **上传文件**
   ```
   - 将整个 dist/ 目录内容上传到服务器根目录
   - 确保 index.html 在根目录
   - 确保 /assets/ 目录及其文件正确上传
   ```

2. **服务器配置**
   ```nginx
   # Nginx 配置示例
   location / {
       try_files $uri $uri/ /index.html;
   }
   
   location /assets/ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **CDN资源配置**
   需要将以下本地资源上传到腾讯CDN，并更新URL：
   - 音乐图标: `/vector/music.svg` → `https://mat1.gtimg.com/rain/apub2019/swim-music-icon.svg`
   - 加载图片: `/loading/loading.png` → `https://mat1.gtimg.com/rain/apub2019/swim-loading-image.png`
   - Favicon相关文件

## 验证部署

1. 访问部署URL，检查页面是否正常加载
2. 打开浏览器开发者工具，确认没有404错误
3. 检查网络面板，确认所有静态资源正确加载
4. 测试游戏功能是否正常

## 故障排除

### 常见问题

1. **JS文件404错误**
   - 检查 `/assets/` 目录是否正确上传
   - 确认文件名与 index.html 中的引用一致

2. **CSS样式不生效**
   - 检查CSS文件路径
   - 确认服务器正确设置了Content-Type

3. **CDN资源加载失败**
   - 检查CDN URL是否可访问
   - 考虑添加fallback到本地资源

### 性能优化

- 启用Gzip压缩
- 配置合适的缓存策略
- 使用CDN加速静态资源加载
- 考虑启用HTTP/2

## 监控和统计

项目已集成灯塔SDK，会自动上报页面访问数据到腾讯数据平台。 