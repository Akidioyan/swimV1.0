/**
 * 统一资源管理器
 * 负责预加载所有游戏资源
 */
import { ObstacleAssets, PowerUpAssets, StarEffects } from './obstacles/AssetManager.js'
import { SpriteObstacleAssets } from './obstacles/SpriteObstacleAssets.js'
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
    this.spriteObstacleAssets = null  // 新的雪碧图障碍物资源管理器
    this.powerUpAssets = null
    this.starEffects = null
    this.swimmerAnimation = null
    this.backgroundImage = null
    this.introImage = null
    this.videoElement = null
    
    // UI图片资源存储
    this.uiImages = {}
    
    // 教学卡片资源存储
    this.tutorialCards = {}
    
    // SVG图标资源存储
    this.svgIcons = {}
    
    // 字体资源存储
    this.fonts = {}
    
    // 资源列表
    this.resources = {
      images: [
        { name: 'background', src: '/bg-menu.png' },
        { name: 'intro', src: '/intro.png' },
        { name: 'loadingImage', src: '/loading/loading.png' }
      ],
      tutorialCards: [
        { name: 'mainCard', src: '/card/tur_card.png' },
        { name: 'tipLeft', src: '/card/tip1-left.png' },
        { name: 'tipRight', src: '/card/tip1-right.png' }
      ],
      svgIcons: [
        // UI-top.vue 中的SVG图标
        { name: 'heart', src: '/vector/heart.svg' },
        { name: 'star', src: '/vector/Star.svg' },
        { name: 'distance', src: '/vector/Distance.svg' },
        { name: 'set', src: '/vector/set.svg' },
        { name: 'gold', src: '/vector/gold.svg' },
        { name: 'restart', src: '/vector/restart.svg' },
        { name: 'question', src: '/vector/Question.svg' },
        { name: 'soundOn', src: '/vector/Sound-on.svg' },
        { name: 'soundOff', src: '/vector/Sound-off.svg' },
        { name: 'hint', src: '/vector/hint.svg' },
        { name: 'vecLeft', src: '/vector/Vec-left.svg' },
        { name: 'vecRight', src: '/vector/Vec-right.svg' },
        // LoadingView.vue 中的SVG图标
        { name: 'music', src: '/vector/music.svg' }
      ],
      fonts: [
        { name: 'FZLTCH', src: '/font/FZLTCH.ttf' },
        { name: 'HPQDGS', src: '/font/HPQDGS.ttf' }
      ],
      videos: [
        { name: 'opening', src: '/video/OpeningVideo.mp4' }
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
        this.loadVideo(),
        this.loadFonts()
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
      this.resources.images.length +      // 基础图片
      this.resources.tutorialCards.length + // 教学卡片
      this.resources.svgIcons.length +    // SVG图标
      this.resources.fonts.length +       // 字体
      (this.resources.videos?.length || 0) + // 视频（可选）
      6 + // 障碍物图片 (obs1: 3, obs2: 2, obs3: 1) - 旧系统
      3 + // 雪碧图障碍物图片 (obs.png, obs3-1.png, obs3-2.png) - 新系统
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
      const totalImages = this.resources.images.length + 
                         this.resources.tutorialCards.length + 
                         this.resources.svgIcons.length
      
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
      
      // 加载教学卡片图片
      this.resources.tutorialCards.forEach(imageConfig => {
        const img = new Image()
        img.onload = () => {
          this.tutorialCards[imageConfig.name] = img
          
          this.loadedResources++
          loadedCount++
          this.updateProgress()
          
          if (loadedCount >= totalImages) {
            resolve()
          }
        }
        img.onerror = () => {
          console.warn(`Failed to load tutorial card: ${imageConfig.src}`)
          this.loadedResources++
          loadedCount++
          this.updateProgress()
          
          if (loadedCount >= totalImages) {
            resolve()
          }
        }
        img.src = imageConfig.src
      })
      
      // 加载SVG图标
      this.resources.svgIcons.forEach(iconConfig => {
        const img = new Image()
        img.onload = () => {
          this.svgIcons[iconConfig.name] = img
          
          this.loadedResources++
          loadedCount++
          this.updateProgress()
          
          if (loadedCount >= totalImages) {
            resolve()
          }
        }
        img.onerror = () => {
          console.warn(`Failed to load SVG icon: ${iconConfig.src}`)
          this.loadedResources++
          loadedCount++
          this.updateProgress()
          
          if (loadedCount >= totalImages) {
            resolve()
          }
        }
        img.src = iconConfig.src
      })
    })
  }
  
  /**
   * 加载字体资源
   */
  async loadFonts() {
    return new Promise((resolve) => {
      let loadedCount = 0
      const totalFonts = this.resources.fonts.length
      
      if (totalFonts === 0) {
        resolve()
        return
      }
      
      this.resources.fonts.forEach(fontConfig => {
        const fontFace = new FontFace(fontConfig.name, `url(${fontConfig.src})`)
        
        fontFace.load().then((loadedFont) => {
          document.fonts.add(loadedFont)
          this.fonts[fontConfig.name] = loadedFont
          
          this.loadedResources++
          loadedCount++
          this.updateProgress()
          
          if (loadedCount >= totalFonts) {
            resolve()
          }
        }).catch((error) => {
          console.warn(`Failed to load font: ${fontConfig.src}`, error)
          this.loadedResources++
          loadedCount++
          this.updateProgress()
          
          if (loadedCount >= totalFonts) {
            resolve()
          }
        })
      })
    })
  }
  
  /**
   * 加载资源管理器
   */
  async loadAssetManagers() {
    return new Promise((resolve) => {
      let completedManagers = 0
      const totalManagers = 5 // obstacleAssets, spriteObstacleAssets, powerUpAssets, swimmerAnimation, starEffects
      
      // 创建旧的障碍物资源管理器（保留作为降级）
      this.obstacleAssets = new ObstacleAssets()
      this.monitorAssetManager(this.obstacleAssets, 6, () => {
        completedManagers++
        if (completedManagers >= totalManagers) {
          resolve()
        }
      })
      
      // 创建新的雪碧图障碍物资源管理器
      this.spriteObstacleAssets = new SpriteObstacleAssets()
      this.monitorSpriteAssetManager(this.spriteObstacleAssets, 3, () => {
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
   * 监控雪碧图资源管理器加载进度
   * @param {SpriteObstacleAssets} spriteAssets - 雪碧图资源管理器
   * @param {number} expectedCount - 预期资源数量
   * @param {Function} onComplete - 完成回调
   */
  monitorSpriteAssetManager(spriteAssets, expectedCount, onComplete) {
    const checkProgress = () => {
      if (spriteAssets.checkAllLoaded()) {
        this.loadedResources += expectedCount
        this.updateProgress()
        if (onComplete) onComplete()
      } else {
        // 每100ms检查一次进度
        setTimeout(checkProgress, 100)
      }
    }
    
    // 开始检查
    checkProgress()
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
      video.playsInline = true
      video.crossOrigin = 'anonymous'
      
      let resolved = false
      
      // 增加更详细的加载事件监听
      video.onloadstart = () => {
        console.log('🎬 开始加载视频...')
      }
      
      video.onprogress = () => {
        console.log('🎬 视频加载中...')
      }
      
      video.oncanplay = () => {
        console.log('🎬 视频可以播放')
      }
      
      video.oncanplaythrough = () => {
        if (!resolved) {
          console.log('🎬 视频完全加载完成')
          this.videoElement = video
          this.loadedResources++
          this.updateProgress()
          resolved = true
          resolve()
        }
      }
      
      video.onloadeddata = () => {
        console.log('🎬 视频数据加载完成')
        // 如果 canplaythrough 事件没有触发，使用 loadeddata 作为备选
        if (!resolved) {
          setTimeout(() => {
            if (!resolved) {
              console.log('🎬 使用备选完成信号')
              this.videoElement = video
              this.loadedResources++
              this.updateProgress()
              resolved = true
              resolve()
            }
          }, 1000)
        }
      }
      
      video.onerror = (event) => {
        console.warn('❌ 视频加载失败:', event)
        if (!resolved) {
          // 即使加载失败也继续，避免卡住加载流程
          this.loadedResources++
          this.updateProgress()
          resolved = true
          resolve()
        }
      }
      
      // 设置超时处理，避免无限等待
      setTimeout(() => {
        if (!resolved) {
          console.warn('⏰ 视频加载超时，继续游戏流程')
          this.loadedResources++
          this.updateProgress()
          resolved = true
          resolve()
        }
      }, 10000) // 10秒超时
      
      // 开始加载视频
      video.src = '/video/OpeningVideo.mp4'
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
    if (this.loadingProgress < 20) {
      return '正在加载游戏资源...'
    } else if (this.loadingProgress < 40) {
      return '正在加载障碍物和道具...'
    } else if (this.loadingProgress < 60) {
      return '正在加载动画和特效...'
    } else if (this.loadingProgress < 80) {
      return '正在预加载游戏视频...'
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
      spriteObstacleAssets: this.spriteObstacleAssets,  // 新增雪碧图障碍物资源
      powerUpAssets: this.powerUpAssets,
      starEffects: this.starEffects,
      swimmerAnimation: this.swimmerAnimation,
      backgroundImage: this.backgroundImage,
      introImage: this.introImage,
      uiImages: this.uiImages,
      tutorialCards: this.tutorialCards, // 新增教学卡片资源
      svgIcons: this.svgIcons, // 新增SVG图标资源
      fonts: this.fonts, // 新增字体资源
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
   * 获取指定的教学卡片图片
   * @param {string} name - 教学卡片名称
   * @returns {Image|null} 教学卡片图片对象
   */
  getTutorialCard(name) {
    return this.tutorialCards[name] || null
  }
  
  /**
   * 获取指定的SVG图标
   * @param {string} name - SVG图标名称
   * @returns {Image|null} SVG图标对象
   */
  getSVGIcon(name) {
    return this.svgIcons[name] || null
  }
  
  /**
   * 获取指定的字体
   * @param {string} name - 字体名称
   * @returns {FontFace|null} 字体对象
   */
  getFont(name) {
    return this.fonts[name] || null
  }
  
  /**
   * 获取所有教学卡片图片
   * @returns {Object} 所有教学卡片图片对象
   */
  getAllTutorialCards() {
    return this.tutorialCards
  }
  
  /**
   * 获取所有SVG图标
   * @returns {Object} 所有SVG图标对象
   */
  getAllSVGIcons() {
    return this.svgIcons
  }
  
  /**
   * 检查所有资源是否加载完成
   */
  checkAllLoaded() {
    return this.isLoaded
  }
}