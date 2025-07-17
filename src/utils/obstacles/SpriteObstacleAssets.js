/**
 * 基于雪碧图的障碍物资源管理器
 * 简化资源管理，提高性能
 */
export class SpriteObstacleAssets {
  constructor() {
    this.sprites = {}
    this.isLoaded = false
    this.loadProgress = 0
    
    // 雪碧图配置
    this.spriteConfig = {
      // obs.png - 1行2列静态雪碧图
      static: {
        src: '/obs/obs.png',
        rows: 1,
        cols: 2,
        frameCount: 2,
        mapping: {
          obs1: 0, // 第1帧
          obs2: 1  // 第2帧
        }
      },
      // obs3-1.png - 6行4列动画雪碧图（安全状态）
      obs3Safe: {
        src: '/obs/obs3-1.png',
        rows: 6,
        cols: 4,
        frameCount: 24
      },
      // obs3-2.png - 6行4列动画雪碧图（危险状态）
      obs3Danger: {
        src: '/obs/obs3-2.png',
        rows: 6,
        cols: 4,
        frameCount: 24
      }
    }
    
    this.loadSprites()
  }
  
  /**
   * 加载所有雪碧图
   */
  loadSprites() {
    const spriteKeys = Object.keys(this.spriteConfig)
    let loadedCount = 0
    
    spriteKeys.forEach(key => {
      const config = this.spriteConfig[key]
      const img = new Image()
      
      img.onload = () => {
        this.sprites[key] = {
          image: img,
          config: config,
          frameWidth: img.naturalWidth / config.cols,
          frameHeight: img.naturalHeight / config.rows
        }
        
        loadedCount++
        this.loadProgress = (loadedCount / spriteKeys.length) * 100
        
        if (loadedCount === spriteKeys.length) {
          this.isLoaded = true
          console.log('🎨 雪碧图障碍物资源加载完成')
        }
      }
      
      img.onerror = () => {
        console.warn(`Failed to load sprite: ${config.src}`)
        loadedCount++
        this.loadProgress = (loadedCount / spriteKeys.length) * 100
        
        if (loadedCount === spriteKeys.length) {
          this.isLoaded = true
        }
      }
      
      img.src = config.src
    })
  }
  
  /**
   * 绘制障碍物
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {string} type - 障碍物类型
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} animationFrame - 动画帧（用于obs3）
   * @param {string} loopMode - obs3循环模式 ('complex' 或 'simple')
   */
  drawObstacle(ctx, type, x, y, width, height, animationFrame = 0, loopMode = 'complex') {
    if (!this.isLoaded) {
      this.drawFallbackObstacle(ctx, type, x, y, width, height)
      return
    }
    
    switch (type) {
      case 'obs1':
        this.drawStaticObstacle(ctx, 'obs1', x, y, width, height)
        break
      case 'obs2':
        this.drawStaticObstacle(ctx, 'obs2', x, y, width, height)
        break
      case 'obs3':
        this.drawAnimatedObstacle(ctx, x, y, width, height, animationFrame, loopMode)
        break
      default:
        this.drawFallbackObstacle(ctx, type, x, y, width, height)
    }
  }
  
  /**
   * 绘制静态障碍物（obs1, obs2）
   */
  drawStaticObstacle(ctx, type, x, y, width, height) {
    const sprite = this.sprites.static
    if (!sprite || !sprite.image.complete) {
      this.drawFallbackObstacle(ctx, type, x, y, width, height)
      return
    }
    
    const frameIndex = sprite.config.mapping[type]
    const frameWidth = sprite.frameWidth
    const frameHeight = sprite.frameHeight
    
    // 计算源图像位置
    const sx = (frameIndex % sprite.config.cols) * frameWidth
    const sy = Math.floor(frameIndex / sprite.config.cols) * frameHeight
    
    // 绘制到画布
    ctx.drawImage(
      sprite.image,
      sx, sy, frameWidth, frameHeight, // 源位置和大小
      x, y, width, height              // 目标位置和大小
    )
  }
  
  /**
   * 绘制动画障碍物（obs3）
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} animationFrame - 当前动画帧
   * @param {string} loopMode - 循环模式 ('complex' 或 'simple')
   */
  drawAnimatedObstacle(ctx, x, y, width, height, animationFrame, loopMode = 'complex') {
    // 根据动画状态选择雪碧图
    const animState = this.getObs3AnimationState(animationFrame, loopMode)
    const spriteKey = animState.isDangerous ? 'obs3Danger' : 'obs3Safe'
    const sprite = this.sprites[spriteKey]
    
    if (!sprite || !sprite.image.complete) {
      this.drawFallbackObstacle(ctx, 'obs3', x, y, width, height)
      return
    }
    
    const frameIndex = animState.frameIndex
    const frameWidth = sprite.frameWidth
    const frameHeight = sprite.frameHeight
    
    // 计算源图像位置（6行4列）
    const sx = (frameIndex % sprite.config.cols) * frameWidth
    const sy = Math.floor(frameIndex / sprite.config.cols) * frameHeight
    
    // 绘制到画布
    ctx.drawImage(
      sprite.image,
      sx, sy, frameWidth, frameHeight, // 源位置和大小
      x, y, width, height              // 目标位置和大小
    )
  }
  
  /**
   * 获取obs3动画状态
   * 支持两种循环模式：复杂循环和简单循环
   * @param {number} totalFrames - 总帧数
   * @param {string} loopMode - 循环模式 ('complex' 或 'simple')
   * @returns {Object} 动画状态信息
   */
  getObs3AnimationState(totalFrames, loopMode = 'complex') {
    // 减慢动画速度：将实际帧数减为1/3
    const actualFrame = Math.floor(totalFrames / 3)
    
    if (loopMode === 'simple') {
      // 简单循环：只播放obs3-1.png，循环4次
      const SIMPLE_LOOP_FRAMES = 24 * 4  // 96帧一个循环
      const cycleFrame = actualFrame % SIMPLE_LOOP_FRAMES
      const frameIndex = cycleFrame % 24  // 在24帧内循环
      
      return {
        isDangerous: false,  // 简单循环全程安全
        frameIndex: frameIndex,
        cycleFrame: cycleFrame,
        totalCycleFrames: SIMPLE_LOOP_FRAMES,
        loopCompleted: actualFrame > 0 && actualFrame % SIMPLE_LOOP_FRAMES === 0
      }
    } else {
      // 复杂循环：原有的四阶段循环
      const SAFE_FRAMES = 24          // 阶段1：obs3-1.png全部24帧
      const DANGER_FRAMES = 24        // 阶段2：obs3-2.png全部24帧
      const PAUSE_FRAMES = 24         // 阶段3：停留在最后一帧24帧时间
      const REVERSE_FRAMES = 24       // 阶段4：obs3-2.png倒序24帧
      
      // 完整循环的总帧数
      const FULL_CYCLE = SAFE_FRAMES + DANGER_FRAMES + PAUSE_FRAMES + REVERSE_FRAMES
      
      // 获取当前循环内的帧位置
      const cycleFrame = actualFrame % FULL_CYCLE
      
      let isDangerous = false
      let frameIndex = 0
      
      if (cycleFrame < SAFE_FRAMES) {
        // 阶段1：播放obs3-1.png全部24帧（安全状态）
        isDangerous = false
        frameIndex = cycleFrame
      } else if (cycleFrame < SAFE_FRAMES + DANGER_FRAMES) {
        // 阶段2：播放obs3-2.png全部24帧（危险状态）
        isDangerous = true
        frameIndex = cycleFrame - SAFE_FRAMES
      } else if (cycleFrame < SAFE_FRAMES + DANGER_FRAMES + PAUSE_FRAMES) {
        // 阶段3：停留在obs3-2.png的最后一帧
        isDangerous = true
        frameIndex = 23 // 最后一帧
      } else {
        // 阶段4：倒序播放obs3-2.png全部24帧
        isDangerous = true
        const reverseFrame = cycleFrame - SAFE_FRAMES - DANGER_FRAMES - PAUSE_FRAMES
        frameIndex = 23 - reverseFrame // 倒序：23, 22, 21, ..., 0
      }
      
      return {
        isDangerous,
        frameIndex: Math.max(0, Math.min(23, frameIndex)), // 确保帧索引在有效范围内
        cycleFrame,
        totalCycleFrames: FULL_CYCLE,
        loopCompleted: actualFrame > 0 && actualFrame % FULL_CYCLE === 0
      }
    }
  }
  
  /**
   * 检查obs3是否在危险状态（用于碰撞检测）
   * @param {number} animationFrame - 动画帧
   * @param {string} loopMode - 循环模式 ('complex' 或 'simple')
   * @returns {boolean} 是否在危险状态
   */
  isObs3Dangerous(animationFrame, loopMode = 'complex') {
    return this.getObs3AnimationState(animationFrame, loopMode).isDangerous
  }
  
  /**
   * 降级绘制（当雪碧图未加载时）
   */
  drawFallbackObstacle(ctx, type, x, y, width, height) {
    // 使用简单的颜色区分不同类型
    const colors = {
      obs1: '#696969',  // 灰色
      obs2: '#555555',  // 深灰色
      obs3: '#888888'   // 中灰色
    }
    
    ctx.fillStyle = colors[type] || '#999999'
    ctx.fillRect(x, y, width, height)
    
    // 添加类型标识
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(type, x + width/2, y + height/2)
  }
  
  /**
   * 获取加载进度
   * @returns {number} 加载进度百分比
   */
  getLoadProgress() {
    return this.loadProgress
  }
  
  /**
   * 检查是否加载完成
   * @returns {boolean} 是否加载完成
   */
  checkAllLoaded() {
    return this.isLoaded
  }
} 