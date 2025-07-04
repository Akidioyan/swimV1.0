/**
 * 统一资源管理器
 * 管理障碍物、道具和星星的资源加载与渲染
 */
export class ObstacleAssets {
  constructor() {
    this.images = {}
    this.obstacleVariants = {} // 存储每种障碍物的变体图片
    this.isLoaded = false
    
    this.loadAssets()
  }
  
  loadAssets() {
    this.loadObstacleImages()
  }
  
  loadObstacleImages() {
    // 障碍物文件夹配置
    const obstacleConfigs = [
      { 
        name: 'obs1', 
        folder: '/obs/obs1/',
        variants: ['obs1-1.png', 'obs1-2.png', 'obs1-3.png']
      },
      { 
        name: 'obs2', 
        folder: '/obs/obs2/',
        variants: ['obs2-1.png', 'obs2-2.png', 'obs2-3.png']
      },
      { 
        name: 'obs3', 
        folder: '/obs/obs3/',
        variants: ['obs3-1.png']
      }
    ]
    
    let totalImagesToLoad = 0
    let loadedImages = 0
    
    // 计算总图片数量
    obstacleConfigs.forEach(config => {
      totalImagesToLoad += config.variants.length
    })
    
    obstacleConfigs.forEach(config => {
      this.obstacleVariants[config.name] = []
      
      config.variants.forEach(variant => {
        const img = new Image()
        img.src = config.folder + variant
        img.onload = () => {
          this.obstacleVariants[config.name].push(img)
          loadedImages++
          
          // 检查是否所有图片都已加载
          if (loadedImages >= totalImagesToLoad) {
            this.isLoaded = true
          }
        }
        img.onerror = () => {
          console.warn(`Failed to load obstacle image: ${config.folder + variant}`)
          loadedImages++
          
          // 即使加载失败也要检查是否完成
          if (loadedImages >= totalImagesToLoad) {
            this.isLoaded = true
          }
        }
      })
    })
  }
  
  checkAllLoaded() {
    return this.isLoaded
  }
  
  // 随机选择障碍物变体图片
  getRandomObstacleImage(type) {
    const variants = this.obstacleVariants[type]
    if (variants && variants.length > 0) {
      const randomIndex = Math.floor(Math.random() * variants.length)
      return variants[randomIndex]
    }
    return null
  }
  
  // 修改：根据固定索引获取障碍物图片
  getObstacleImageByIndex(type, index) {
    const variants = this.obstacleVariants[type]
    if (variants && variants.length > 0 && index < variants.length) {
      return variants[index]
    }
    return variants && variants.length > 0 ? variants[0] : null
  }
  
  // 修改drawObstacle方法，接受imageVariantIndex参数
  drawObstacle(ctx, type, x, y, width, height, imageVariantIndex = 0) {
    // 使用固定索引选择障碍物变体图片
    const image = this.getObstacleImageByIndex(type, imageVariantIndex)
    if (image && image.complete) {
      ctx.drawImage(image, x, y, width, height)
    } else {
      // 降级绘制
      this.drawFallbackObstacle(ctx, type, x, y, width, height)
    }
  }
  
  drawFallbackObstacle(ctx, type, x, y, width, height) {
    ctx.fillStyle = '#696969'
    ctx.fillRect(x, y, width, height)
    
    // 根据类型添加简单的视觉区分
    switch (type) {
      case 'obs1':
        // 静止障碍物 - 添加边框
        ctx.strokeStyle = '#333333'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, width, height)
        break
      case 'obs2':
        // 移动障碍物 - 添加动态效果
        ctx.fillStyle = '#555555'
        ctx.fillRect(x + 2, y + 2, width - 4, height - 4)
        break
      case 'obs3':
        // 自定义障碍物 - 添加特殊标记
        ctx.fillStyle = '#888888'
        ctx.fillRect(x + width/4, y + height/4, width/2, height/2)
        break
    }
  }
}

/**
 * 道具资源管理器  
 */
export class PowerUpAssets {
  constructor() {
    this.images = {}
    this.isLoaded = false
    
    // 道具图片列表
    this.powerUpImages = [
      { name: 'snorkel', src: '/Props/snorkel/snorkel.png' },
      { name: 'snorkel-glow', src: '/Props/snorkel/snorkel-glow.png' },
      { name: 'star', src: '/Props/star/star.png' },
      { name: 'star-glow', src: '/Props/star/star-glow.png' },
      { name: 'bubble', src: '/Props/bubble/bubble.png' } // 护盾效果
    ]
    
    this.loadAssets()
  }
  
  loadAssets() {
    this.powerUpImages.forEach(powerUp => {
      const img = new Image()
      img.src = powerUp.src
      img.onload = () => {
        this.images[powerUp.name] = img
        // 检查是否所有图片都已加载
        if (Object.keys(this.images).length === this.powerUpImages.length) {
          this.isLoaded = true
        }
      }
      img.onerror = () => {
        console.warn(`Failed to load power-up image: ${powerUp.src}`)
      }
    })
  }
  
  drawPowerUp(ctx, type, x, y, width, height, glowing = false) {
    const imageName = glowing ? `${type}-glow` : type
    const image = this.images[imageName] || this.images[type]
    
    if (image && image.complete) {
      // 计算保持宽高比的尺寸
      const imageAspectRatio = image.naturalWidth / image.naturalHeight
      const targetAspectRatio = width / height
      
      let drawWidth, drawHeight, drawX, drawY
      
      if (imageAspectRatio > targetAspectRatio) {
        // 图片更宽，以宽度为准
        drawWidth = width
        drawHeight = width / imageAspectRatio
        drawX = x
        drawY = y + (height - drawHeight) / 2
      } else {
        // 图片更高，以高度为准
        drawHeight = height
        drawWidth = height * imageAspectRatio
        drawX = x + (width - drawWidth) / 2
        drawY = y
      }
      
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
    } else {
      // 降级绘制
      this.drawFallbackPowerUp(ctx, type, x, y, width, height, glowing)
    }
  }
  
  drawFallbackPowerUp(ctx, type, x, y, width, height, glowing) {
    if (glowing) {
      ctx.shadowColor = this.getGlowColor(type)
      ctx.shadowBlur = 10
    }
    
    switch (type) {
      case 'snorkel':
        ctx.fillStyle = '#FF4500' // 橙红色
        ctx.fillRect(x + 5, y, width - 10, height/3)
        ctx.fillRect(x + width - 10, y - height/4, 5, height/2)
        break
      case 'star':
        ctx.fillStyle = '#FFD700' // 金色
        this.drawStar(ctx, x + width/2, y + height/2, width/3, width/6, 5)
        break
      case 'shield':
        ctx.fillStyle = '#4169E1' // 蓝色
        this.drawShield(ctx, x + width/2, y + height/2, width/2)
        break
    }
    
    if (glowing) {
      ctx.shadowBlur = 0
    }
  }
  
  getGlowColor(type) {
    switch (type) {
      case 'snorkel': return '#FF4500'
      case 'star': return '#FFD700'
      case 'shield': return '#4169E1'
      default: return '#FFFFFF'
    }
  }
  
  // 绘制五角星
  drawStar(ctx, cx, cy, outerRadius, innerRadius, points) {
    const angle = Math.PI / points
    ctx.beginPath()
    
    for (let i = 0; i < 2 * points; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const x = cx + Math.cos(i * angle - Math.PI / 2) * radius
      const y = cy + Math.sin(i * angle - Math.PI / 2) * radius
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.closePath()
    ctx.fill()
  }
  
  // 绘制护盾
  drawShield(ctx, cx, cy, radius) {
    ctx.beginPath()
    ctx.arc(cx, cy - radius/4, radius, 0, Math.PI, false)
    ctx.lineTo(cx - radius/2, cy + radius/2)
    ctx.lineTo(cx, cy + radius)
    ctx.lineTo(cx + radius/2, cy + radius/2)
    ctx.closePath()
    ctx.fill()
  }
}

/**
 * 星星特效管理器
 */
export class StarEffects {
  constructor() {
    this.particles = []
  }
  
  createStarEffect(x, y) {
    // 创建星星收集特效
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 30,
        maxLife: 30,
        size: Math.random() * 3 + 1,
        color: '#FFD700'
      })
    }
  }
  
  update(gameSpeed = 0) {
    this.particles = this.particles.filter(particle => {
      // 粒子自身的移动
      particle.x += particle.vx
      particle.y += particle.vy
      
      // 与游戏速度保持一致的向下移动
      particle.y += gameSpeed
      
      particle.life--
      particle.vy += 0.1 // 轻微重力
      return particle.life > 0
    })
  }
  
  draw(ctx) {
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife
      ctx.globalAlpha = alpha
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }
}

