/**
 * Sprite动画系统
 */

export class SpriteAnimation {
  constructor(imageSrc, frameWidth, frameHeight, frameCount, fps = 12, columns = 0) {
    this.image = new Image()
    this.image.src = imageSrc
    this.frameWidth = frameWidth
    this.frameHeight = frameHeight
    this.frameCount = frameCount
    this.fps = fps
    this.currentFrame = 0
    this.lastFrameTime = 0
    this.frameInterval = 1000 / fps
    this.isLoaded = false
    this.columns = columns || frameCount // 如果没有指定列数，默认为单行
    
    this.image.onload = () => {
      this.isLoaded = true
    }
  }
  
  update(deltaTime) {
    if (!this.isLoaded) return
    
    this.lastFrameTime += deltaTime
    
    if (this.lastFrameTime >= this.frameInterval) {
      this.currentFrame = (this.currentFrame + 1) % this.frameCount
      this.lastFrameTime = 0
    }
  }
  
  draw(ctx, x, y, width = this.frameWidth, height = this.frameHeight) {
    if (!this.isLoaded) return
    
    // 计算当前帧在雪碧图中的位置
    const col = this.currentFrame % this.columns
    const row = Math.floor(this.currentFrame / this.columns)
    
    const sourceX = col * this.frameWidth
    const sourceY = row * this.frameHeight
    
    ctx.drawImage(
      this.image,
      sourceX, sourceY,
      this.frameWidth, this.frameHeight,
      x, y,
      width, height
    )
  }
  
  reset() {
    this.currentFrame = 0
    this.lastFrameTime = 0
  }
}

/**
 * 游泳者角色动画管理器
 */
export class SwimmerAnimation {
  constructor() {
    this.animations = {}
    this.currentAnimation = 'swim'
    this.isLoaded = false
    
    // 初始化动画
    this.loadSwimAnimation()
  }
  
  loadSwimAnimation() {
    // 新的游泳雪碧图规格：1000*1600像素，5列*8行
    // 每帧尺寸：200*200像素（1000/5 = 200, 1600/8 = 200）
    // 总帧数：5*8 = 40帧
    // 播放顺序：先从左到右，再从上到下
    
    this.animations.swim = new SpriteAnimation(
      '/swimer.png',
      200,         // 每帧宽度 (1000/5)
      200,         // 每帧高度 (1600/8) 
      40,          // 总帧数 (5×8)
      12,          // 帧率 (每秒12帧)
      5            // 列数
    )
    
    this.isLoaded = true
  }
  
  update(deltaTime) {
    if (this.animations[this.currentAnimation]) {
      this.animations[this.currentAnimation].update(deltaTime)
    }
  }
  
  draw(ctx, x, y, width, height) {
    if (this.animations[this.currentAnimation]) {
      this.animations[this.currentAnimation].draw(ctx, x, y, width, height)
    }
  }
  
  setAnimation(animationName) {
    if (this.animations[animationName] && this.currentAnimation !== animationName) {
      this.currentAnimation = animationName
      this.animations[animationName].reset()
    }
  }
}

/**
 * 障碍物资源管理器
 */
export class ObstacleAssets {
  constructor() {
    this.images = {}
    this.animations = {}
    this.isLoaded = false
    
    // 静态障碍物图片
    this.staticImages = [
      { name: 'obs1', src: '/obs/obs1/obs1.png' }, // 静止障碍物
      { name: 'obs3', src: '/obs/obs3/obs3.png' }, // 水下障碍物
      { name: 'obs4', src: '/obs/obs4/obs4.png' }  // 电动水母障碍物
    ]
    
    // 动画障碍物帧序列
    this.animationSequences = {
      obs2: {
        basePath: '/obs/obs2/obs2.png',
        frameCount: 1,
        frameDelay: 200
      }
    }
    
    this.loadAssets()
  }
  
  // 添加缺失的 loadAssets 方法
  loadAssets() {
    this.loadObstacleImages()
    this.loadObstacleAnimations()
    this.isLoaded = true
  }
  
  loadObstacleImages() {
    const obstacles = [
      { name: 'obs1', src: '/obs/obs1.png' }, // 静止障碍物
      { name: 'obs3', src: '/obs/obs3.png' }, // 水下障碍物
      { name: 'obs4', src: '/obs/obs4.png' }  // 电动水母障碍物
    ]
    
    obstacles.forEach(obstacle => {
      const img = new Image()
      img.src = obstacle.src
      img.onload = () => {
        this.images[obstacle.name] = img
      }
    })
  }
  
  loadObstacleAnimations() {
    // obs2.png 作为雪碧图动画：300*500像素，3列*5行（共15帧）
    // obs2是移动障碍物，使用动画
    this.animations.obs2 = new SpriteAnimation(
      '/obs/obs2.png',
      100,         // 每帧宽度 (300/3)
      100,         // 每帧高度 (500/5)
      15,          // 总帧数 (3×5)
      8,           // 帧率 (每秒8帧，适合障碍物动画)
      3            // 列数
    )
  }
  
  update(deltaTime) {
    // 更新所有动画
    Object.values(this.animations).forEach(animation => {
      animation.update(deltaTime)
    })
  }
  
  drawObstacle(ctx, type, x, y, width, height) {
    // 检查是否有动画版本
    if (this.animations[type]) {
      this.animations[type].draw(ctx, x, y, width, height)
    } else {
      // 使用静态图片
      const image = this.images[type]
      if (image && image.complete) {
        ctx.drawImage(image, x, y, width, height)
      } else {
        // 降级到绘制简单形状
        this.drawFallbackObstacle(ctx, type, x, y, width, height)
      }
    }
  }
  
  drawFallbackObstacle(ctx, type, x, y, width, height) {
    // 所有类型都绘制为石头
    ctx.fillStyle = '#696969'
    ctx.fillRect(x, y, width, height)
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
      { name: 'bubble', src: '/Props/bubble/bubble.png' } // 添加bubble图片
    ]
    
    this.loadAssets()
  }
  
  // 添加缺失的 loadAssets 方法
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
      ctx.drawImage(image, x, y, width, height)
    } else {
      // 降级到绘制简单形状
      this.drawFallbackPowerUp(ctx, type, x, y, width, height, glowing)
    }
  }
  
  drawFallbackPowerUp(ctx, type, x, y, width, height, glowing) {
    if (glowing) {
      ctx.shadowColor = type === 'snorkel' ? '#00FF00' : '#FFD700'
      ctx.shadowBlur = 10
    }
    
    switch (type) {
      case 'snorkel':
        ctx.fillStyle = '#00FF00'
        ctx.fillRect(x + 5, y, width - 10, height/3)
        ctx.fillRect(x + width - 10, y - height/4, 5, height/2)
        break
      case 'star':
        // 绘制五角星
        ctx.fillStyle = '#FFD700'
        this.drawStar(ctx, x + width/2, y + height/2, width/3, width/6, 5)
        break
    }
    
    if (glowing) {
      ctx.shadowBlur = 0
    }
  }
  
  // 绘制五角星的辅助方法
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
}