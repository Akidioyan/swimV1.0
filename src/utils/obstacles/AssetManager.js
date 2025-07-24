/**
 * 统一资源管理器
 * 管理障碍物、道具和星星的资源加载与渲染
 */
export class ObstacleAssets {
  constructor() {
    this.obstacleVariants = {}
    this.isLoaded = false
    
    // 障碍物图片配置 - 直接使用本地路径
    this.obstacleConfig = [
      {
        name: 'obs1',
        variants: ['/obs/obs.png']
      },
      {
        name: 'obs2',
        variants: ['/obs/obs.png']
      },
      {
        name: 'obs3',
        variants: ['/obs/obs3-1.png', '/obs/obs3-2.png']
      }
    ]
    
    this.loadAssets()
  }
  
  loadAssets() {
    this.loadObstacleImages()
  }
  
  loadObstacleImages() {
    let totalImagesToLoad = 0
    let loadedImages = 0
    
    // 计算总图片数量
    this.obstacleConfig.forEach(config => {
      totalImagesToLoad += config.variants.length
    })
    
    this.obstacleConfig.forEach(config => {
      this.obstacleVariants[config.name] = []
      
      config.variants.forEach(variant => {
        const img = new Image()
        img.src = variant // 直接使用配置中的完整路径
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
      { name: 'snorkel', src: 'props/snorkel.png' },
      { name: 'snorkel-glow', src: 'props/snorkel-glow.png' },
      { name: 'star', src: 'props/star.png' },
      { name: 'star-glow', src: 'props/star-glow.png' },
      { name: 'bubble', src: 'props/bubble.png' } // 护盾效果
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
 * 星星特效管理器 - 已禁用所有粒子效果
 */
export class StarEffects {
  constructor() {
    this.particles = []
  }
  
  createStarEffect(x, y) {
    // 粒子效果已禁用
    return
  }
  
  update(gameSpeed = 0) {
    // 粒子效果已禁用
    this.particles = []
  }
  
  draw(ctx) {
    // 粒子效果已禁用
    return
  }
}

