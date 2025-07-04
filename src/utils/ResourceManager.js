/**
 * 统一资源管理器
 * 负责预加载所有游戏资源
 */
import { ObstacleAssets, PowerUpAssets, StarEffects } from './obstacles/AssetManager.js'
import { SwimmerAnimation } from './spriteAnimation.js'

export class ResourceManager {
  constructor() {
    this.loadingProgress = 0
    this.totalResources = 0
    this.loadedResources = 0
    this.isLoaded = false
    this.onProgressUpdate = null
    this.onLoadComplete = null
    
    // 资源管理器实例
    this.obstacleAssets = null
    this.powerUpAssets = null
    this.starEffects = null
    this.swimmerAnimation = null
    this.backgroundImage = null
    this.introImage = null
    this.videoElement = null
    
    // UI图片资源存储
    this.uiImages = {}
    
    // 资源列表
    this.resources = {
      images: [
        { name: 'background', src: '/bg-menu.png' },
        { name: 'intro', src: '/intro.png' }
      ],
      uiImages: [
        { name: 'distanceBg', src: '/ui/distance-bg.png' },
        { name: 'heartEmpty', src: '/ui/heart-empty.png' },
        { name: 'heart', src: '/ui/heart.png' },
        { name: 'livesBg', src: '/ui/lives-bg.png' },
        { name: 'pause', src: '/ui/pause.png' },
        { name: 'play', src: '/ui/play.png' },
        { name: 'soundOff', src: '/ui/sound-off.png' },
        { name: 'soundOn', src: '/ui/sound-on.png' },
        { name: 'uiBg', src: '/ui/ui-bg.png' }
      ],
      videos: [
        { name: 'opening', src: '/OpeningVideo.mp4' }
      ]
    }
  }
  
  /**
   * 开始加载所有资源
   * @param {Function} onProgress - 进度回调函数
   * @param {Function} onComplete - 完成回调函数
   */
  async loadAllResources(onProgress, onComplete) {
    this.onProgressUpdate = onProgress
    this.onLoadComplete = onComplete
    
    // 计算总资源数量
    this.calculateTotalResources()
    
    try {
      // 并行加载所有资源
      await Promise.allSettled([
        this.loadImages(),
        this.loadAssetManagers(),
        this.loadVideo()
      ])
      
      this.isLoaded = true
      this.loadingProgress = 100
      this.updateProgress()
      
      if (this.onLoadComplete) {
        this.onLoadComplete()
      }
    } catch (error) {
      console.error('资源加载失败:', error)
      // 即使有错误也标记为完成，使用降级方案
      this.isLoaded = true
      this.loadingProgress = 100
      this.updateProgress()
      
      if (this.onLoadComplete) {
        this.onLoadComplete()
      }
    }
  }
  
  /**
   * 计算总资源数量
   */
  calculateTotalResources() {
    this.totalResources = 
      this.resources.images.length + // 基础图片
      this.resources.uiImages.length + // UI图片
      this.resources.videos.length + // 视频
      6 + // 障碍物图片 (obs1: 3, obs2: 2, obs3: 1)
      5 + // 道具图片 (snorkel, snorkel-glow, star, star-glow, bubble)
      1 + // 游泳者动画
      1   // 星星特效管理器
  }
  
  /**
   * 加载基础图片资源
   */
  async loadImages() {
    return new Promise((resolve) => {
      let loadedCount = 0
      const totalImages = this.resources.images.length + this.resources.uiImages.length
      
      if (totalImages === 0) {
        resolve()
        return
      }
      
      // 加载基础图片
      this.resources.images.forEach(imageConfig => {
        const img = new Image()
        img.onload = () => {
          if (imageConfig.name === 'background') {
            this.backgroundImage = img
          } else if (imageConfig.name === 'intro') {
            this.introImage = img
          }
          
          this.loadedResources++
          loadedCount++
          this.updateProgress()
          
          if (loadedCount >= totalImages) {
            resolve()
          }
        }
        img.onerror = () => {
          console.warn(`Failed to load image: ${imageConfig.src}`)
          this.loadedResources++
          loadedCount++
          this.updateProgress()
          
          if (loadedCount >= totalImages) {
            resolve()
          }
        }
        img.src = imageConfig.src
      })
      
      // 加载UI图片
      this.resources.uiImages.forEach(imageConfig => {
        const img = new Image()
        img.onload = () => {
          this.uiImages[imageConfig.name] = img
          
          this.loadedResources++
          loadedCount++
          this.updateProgress()
          
          if (loadedCount >= totalImages) {
            resolve()
          }
        }
        img.onerror = () => {
          console.warn(`Failed to load UI image: ${imageConfig.src}`)
          this.loadedResources++
          loadedCount++
          this.updateProgress()
          
          if (loadedCount >= totalImages) {
            resolve()
          }
        }
        img.src = imageConfig.src
      })
    })
  }
  
  /**
   * 加载资源管理器
   */
  async loadAssetManagers() {
    return new Promise((resolve) => {
      let completedManagers = 0
      const totalManagers = 4 // obstacleAssets, powerUpAssets, swimmerAnimation, starEffects
      
      // 创建障碍物资源管理器
      this.obstacleAssets = new ObstacleAssets()
      this.monitorAssetManager(this.obstacleAssets, 6, () => {
        completedManagers++
        if (completedManagers >= totalManagers) {
          resolve()
        }
      })
      
      // 创建道具资源管理器
      this.powerUpAssets = new PowerUpAssets()
      this.monitorAssetManager(this.powerUpAssets, 5, () => {
        completedManagers++
        if (completedManagers >= totalManagers) {
          resolve()
        }
      })
      
      // 创建游泳者动画
      this.swimmerAnimation = new SwimmerAnimation()
      this.monitorSwimmerAnimation(() => {
        completedManagers++
        if (completedManagers >= totalManagers) {
          resolve()
        }
      })
      
      // 创建星星特效管理器（无需等待）
      this.starEffects = new StarEffects()
      this.loadedResources++
      this.updateProgress()
      completedManagers++
      if (completedManagers >= totalManagers) {
        resolve()
      }
    })
  }
  
  /**
   * 监控资源管理器加载状态
   */
  monitorAssetManager(assetManager, resourceCount, onComplete) {
    const checkLoaded = () => {
      if (assetManager.isLoaded) {
        this.loadedResources += resourceCount
        this.updateProgress()
        onComplete()
      } else {
        setTimeout(checkLoaded, 100)
      }
    }
    checkLoaded()
  }
  
  /**
   * 监控游泳者动画加载状态
   */
  monitorSwimmerAnimation(onComplete) {
    const checkLoaded = () => {
      if (this.swimmerAnimation.animations.swim && this.swimmerAnimation.animations.swim.isLoaded) {
        this.loadedResources++
        this.updateProgress()
        onComplete()
      } else {
        setTimeout(checkLoaded, 100)
      }
    }
    checkLoaded()
  }
  
  /**
   * 加载视频资源
   */
  async loadVideo() {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'auto'
      video.muted = true
      
      video.oncanplaythrough = () => {
        this.videoElement = video
        this.loadedResources++
        this.updateProgress()
        resolve()
      }
      
      video.onerror = () => {
        console.warn('Failed to load video: /OpeningVideo.mp4')
        this.loadedResources++
        this.updateProgress()
        resolve()
      }
      
      video.src = '/OpeningVideo.mp4'
    })
  }
  
  /**
   * 更新加载进度
   */
  updateProgress() {
    this.loadingProgress = Math.round((this.loadedResources / this.totalResources) * 100)
    
    if (this.onProgressUpdate) {
      this.onProgressUpdate(this.loadingProgress, this.getLoadingText())
    }
  }
  
  /**
   * 获取加载文本
   */
  getLoadingText() {
    if (this.loadingProgress < 25) {
      return '正在加载游戏资源...'
    } else if (this.loadingProgress < 50) {
      return '正在加载障碍物和道具...'
    } else if (this.loadingProgress < 75) {
      return '正在加载动画和特效...'
    } else if (this.loadingProgress < 100) {
      return '正在准备游戏场景...'
    } else {
      return '加载完成！'
    }
  }
  
  /**
   * 获取已加载的资源
   */
  getLoadedResources() {
    return {
      obstacleAssets: this.obstacleAssets,
      powerUpAssets: this.powerUpAssets,
      starEffects: this.starEffects,
      swimmerAnimation: this.swimmerAnimation,
      backgroundImage: this.backgroundImage,
      introImage: this.introImage,
      uiImages: this.uiImages, // 新增UI图片资源
      videoElement: this.videoElement,
      isLoaded: this.isLoaded
    }
  }
  
  /**
   * 获取指定的UI图片
   * @param {string} name - UI图片名称
   * @returns {Image|null} UI图片对象
   */
  getUIImage(name) {
    return this.uiImages[name] || null
  }
  
  /**
   * 检查所有资源是否加载完成
   */
  checkAllLoaded() {
    return this.isLoaded
  }
}