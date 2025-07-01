/**
 * 音频管理器 - 单例模式
 * 集中管理所有音效和音乐的播放、暂停、音量控制等
 */
class AudioManager {
  constructor() {
    // 单例模式：确保全局只有一个音频管理器实例
    if (AudioManager.instance) {
      return AudioManager.instance
    }
    AudioManager.instance = this
    
    // 音频对象
    this.backgroundMusic = null
    this.swimmingSound = null
    this.soundEffects = {} // 可扩展的音效对象集合
    
    // 音频状态管理
    this.musicEnabled = true
    this.soundEnabled = true
    this.musicPaused = false
    this.masterVolume = 1.0
    
    // 音频文件路径配置
    this.audioConfig = {
      backgroundMusic: '/Sound/BackgroundSound.mp3',
      swimmingSound: '/Sound/swimming.MP3',
      // 可以在这里添加更多音效文件路径
      // collectSound: '/Sound/collect.mp3',
      // explosionSound: '/Sound/explosion.mp3',
    }
    
    // 音量配置
    this.volumeConfig = {
      backgroundMusic: 0.3,
      swimmingSound: 0.5,
      soundEffects: 0.7
    }
    
    // 初始化标志
    this.isInitialized = false
    
    this.init()
  }
  
  /**
   * 初始化音频资源
   */
  init() {
    if (this.isInitialized) return
    
    try {
      // 初始化背景音乐
      this.backgroundMusic = new Audio(this.audioConfig.backgroundMusic)
      this.backgroundMusic.loop = true
      this.backgroundMusic.volume = this.volumeConfig.backgroundMusic * this.masterVolume
      
      // 初始化游泳音效 - 设置为单次播放，不循环
      this.swimmingSound = new Audio(this.audioConfig.swimmingSound)
      this.swimmingSound.loop = false // 修改为不循环播放
      this.swimmingSound.volume = this.volumeConfig.swimmingSound * this.masterVolume
      
      // 设置音频事件监听器
      this.setupAudioEventListeners()
      
      this.isInitialized = true
      console.log('音频管理器初始化完成')
    } catch (error) {
      console.error('音频初始化失败:', error)
    }
  }
  
  /**
   * 设置音频事件监听器
   */
  setupAudioEventListeners() {
    if (this.backgroundMusic) {
      this.backgroundMusic.addEventListener('error', (e) => {
        console.error('背景音乐加载失败:', e)
      })
      
      this.backgroundMusic.addEventListener('canplaythrough', () => {
        console.log('背景音乐加载完成')
      })
    }
    
    if (this.swimmingSound) {
      this.swimmingSound.addEventListener('error', (e) => {
        console.error('游泳音效加载失败:', e)
      })
    }
  }
  
  /**
   * 播放背景音乐
   */
  playBackgroundMusic() {
    if (!this.musicEnabled || this.musicPaused || !this.backgroundMusic) return
    
    this.backgroundMusic.play().catch(error => {
      console.log('背景音乐播放失败:', error)
    })
  }
  
  /**
   * 暂停背景音乐
   */
  pauseBackgroundMusic() {
    if (this.backgroundMusic && !this.backgroundMusic.paused) {
      this.backgroundMusic.pause()
    }
  }
  
  /**
   * 停止背景音乐
   */
  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause()
      this.backgroundMusic.currentTime = 0
    }
  }
  
  /**
   * 播放游泳音效（切换泳道时的专属音效）
   */
  playSwimmingSound() {
    if (!this.soundEnabled || !this.swimmingSound) return
    
    // 停止之前的播放，确保每次都是清晰的单次播放
    this.swimmingSound.pause()
    this.swimmingSound.currentTime = 0
    
    // 播放音效
    this.swimmingSound.play().catch(error => {
      console.log('游泳音效播放失败:', error)
    })
  }
  
  /**
   * 停止游泳音效
   */
  stopSwimmingSound() {
    if (this.swimmingSound && !this.swimmingSound.paused) {
      this.swimmingSound.pause()
      this.swimmingSound.currentTime = 0
    }
  }
  
  /**
   * 添加新的音效（可扩展功能）
   */
  addSoundEffect(name, path, volume = 0.7) {
    try {
      const audio = new Audio(path)
      audio.volume = volume * this.masterVolume
      this.soundEffects[name] = audio
      console.log(`音效 ${name} 添加成功`)
    } catch (error) {
      console.error(`音效 ${name} 添加失败:`, error)
    }
  }
  
  /**
   * 播放指定音效
   */
  playSoundEffect(name) {
    if (!this.soundEnabled || !this.soundEffects[name]) return
    
    const audio = this.soundEffects[name]
    audio.currentTime = 0
    audio.play().catch(error => {
      console.log(`音效 ${name} 播放失败:`, error)
    })
  }
  
  /**
   * 切换所有音效（包括音乐和音效）
   */
  toggleAllSound() {
    const newState = !this.isSoundOn
    
    this.musicEnabled = newState
    this.soundEnabled = newState
    this.musicPaused = !newState
    
    if (newState) {
      // 开启声音时播放背景音乐
      this.playBackgroundMusic()
    } else {
      // 关闭声音时暂停所有音频
      this.pauseBackgroundMusic()
      this.stopSwimmingSound()
    }
    
    console.log(`音效状态切换为: ${newState ? '开启' : '关闭'}`)
  }
  
  /**
   * 切换音乐
   */
  toggleMusic() {
    this.musicPaused = !this.musicPaused
    
    if (this.musicPaused) {
      this.pauseBackgroundMusic()
    } else if (this.musicEnabled) {
      this.playBackgroundMusic()
    }
    
    console.log(`音乐状态切换为: ${this.musicPaused ? '暂停' : '播放'}`)
  }
  
  /**
   * 切换音效
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled
    
    if (!this.soundEnabled) {
      this.stopSwimmingSound()
      // 停止所有音效
      Object.values(this.soundEffects).forEach(audio => {
        if (!audio.paused) {
          audio.pause()
          audio.currentTime = 0
        }
      })
    }
    
    console.log(`音效状态切换为: ${this.soundEnabled ? '开启' : '关闭'}`)
  }
  
  /**
   * 设置主音量
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    
    // 更新所有音频的音量
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.volumeConfig.backgroundMusic * this.masterVolume
    }
    
    if (this.swimmingSound) {
      this.swimmingSound.volume = this.volumeConfig.swimmingSound * this.masterVolume
    }
    
    // 更新音效音量
    Object.values(this.soundEffects).forEach(audio => {
      audio.volume = this.volumeConfig.soundEffects * this.masterVolume
    })
    
    console.log(`主音量设置为: ${this.masterVolume}`)
  }
  
  /**
   * 设置音乐音量
   */
  setMusicVolume(volume) {
    this.volumeConfig.backgroundMusic = Math.max(0, Math.min(1, volume))
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.volumeConfig.backgroundMusic * this.masterVolume
    }
  }
  
  /**
   * 设置音效音量
   */
  setSoundVolume(volume) {
    this.volumeConfig.swimmingSound = Math.max(0, Math.min(1, volume))
    if (this.swimmingSound) {
      this.swimmingSound.volume = this.volumeConfig.swimmingSound * this.masterVolume
    }
  }
  
  /**
   * 获取音效总开关状态
   */
  get isSoundOn() {
    return this.musicEnabled && this.soundEnabled && !this.musicPaused
  }
  
  /**
   * 获取音乐状态
   */
  get isMusicPlaying() {
    return this.musicEnabled && !this.musicPaused && this.backgroundMusic && !this.backgroundMusic.paused
  }
  
  /**
   * 获取音效状态
   */
  get isSoundEffectEnabled() {
    return this.soundEnabled
  }
  
  /**
   * 重置所有音频状态
   */
  reset() {
    this.stopBackgroundMusic()
    this.stopSwimmingSound()
    
    // 停止所有音效
    Object.values(this.soundEffects).forEach(audio => {
      if (!audio.paused) {
        audio.pause()
        audio.currentTime = 0
      }
    })
    
    // 重置状态
    this.musicEnabled = true
    this.soundEnabled = true
    this.musicPaused = false
    
    console.log('音频管理器状态已重置')
  }
  
  /**
   * 销毁音频管理器（清理资源）
   */
  destroy() {
    this.reset()
    
    // 移除事件监听器
    if (this.backgroundMusic) {
      this.backgroundMusic.removeEventListener('error', () => {})
      this.backgroundMusic.removeEventListener('canplaythrough', () => {})
    }
    
    // 清空音频对象
    this.backgroundMusic = null
    this.swimmingSound = null
    this.soundEffects = {}
    
    this.isInitialized = false
    AudioManager.instance = null
    
    console.log('音频管理器已销毁')
  }
}

// 导出单例实例
export default new AudioManager() 