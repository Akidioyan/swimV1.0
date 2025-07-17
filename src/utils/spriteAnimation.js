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