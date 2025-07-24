/**
 * 手机震动工具模块
 * 提供不同强度的震动反馈，支持与音频状态同步
 */

class VibrationManager {
  constructor() {
    this.isSupported = this.checkSupport()
    this.isEnabled = true // 默认启用震动
    this.isManuallyDisabled = false // 是否被用户手动禁用
    this.audioContext = null
    this.volumeCheckInterval = null
    
    // 初始化音频上下文用于检测音量
    this.initAudioContext()
    
    // 开始监听音量变化
    this.startVolumeMonitoring()
  }

  /**
   * 检查设备是否支持震动
   * @returns {boolean} 是否支持震动
   */
  checkSupport() {
    return 'vibrate' in navigator
  }

  /**
   * 初始化音频上下文
   */
  initAudioContext() {
    try {
      // 创建音频上下文用于检测音量
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (error) {
      console.log('音频上下文初始化失败，跳过音量检测:', error)
    }
  }

  /**
   * 开始监听音量变化
   */
  startVolumeMonitoring() {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      this.checkAudioState()
    })

    // 监听音频上下文状态变化
    if (this.audioContext) {
      this.audioContext.addEventListener('statechange', () => {
        this.checkAudioState()
      })
    }

    // 定时检查音频状态
    this.volumeCheckInterval = setInterval(() => {
      this.checkAudioState()
    }, 1000) // 每秒检查一次
  }

  /**
   * 检查音频状态并同步震动状态
   */
  checkAudioState() {
    try {
      // 检查音频上下文状态
      const isAudioSuspended = this.audioContext && this.audioContext.state === 'suspended'
      
      // 检查设备是否静音（通过创建一个短音频测试）
      const isDeviceMuted = this.isDeviceMuted()
      
      // 同步震动状态：只有在音频正常且未被手动禁用时才启用震动
      const shouldEnableVibration = !isAudioSuspended && !isDeviceMuted && !this.isManuallyDisabled
      
      if (this.isEnabled !== shouldEnableVibration) {
        this.isEnabled = shouldEnableVibration
        console.log(`震动状态已自动同步: ${this.isEnabled ? '启用' : '禁用'} (音频状态: ${isAudioSuspended ? '暂停' : '正常'}, 静音: ${isDeviceMuted})`)
      }
    } catch (error) {
      // 如果检测失败，保持当前状态
      console.log('音频状态检测失败:', error)
    }
  }

  /**
   * 检测设备是否静音
   * @returns {boolean} 是否静音
   */
  isDeviceMuted() {
    try {
      if (!this.audioContext) return false
      
      // 创建一个极短的音频测试静音状态
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      // 设置非常低的音量和短暂的持续时间
      gainNode.gain.value = 0.001
      oscillator.frequency.value = 20000 // 使用超声波频率，人耳听不到
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // 播放极短的音频
      const startTime = this.audioContext.currentTime
      oscillator.start(startTime)
      oscillator.stop(startTime + 0.001) // 1毫秒
      
      // 这里无法直接检测静音，使用其他指标
      return false
    } catch (error) {
      return false
    }
  }

  /**
   * 设置震动启用状态
   * @param {boolean} enabled - 是否启用震动
   * @param {boolean} isManual - 是否为手动设置
   */
  setEnabled(enabled, isManual = false) {
    if (isManual) {
      this.isManuallyDisabled = !enabled
    }
    
    // 只有在未被手动禁用时才能自动启用
    if (!this.isManuallyDisabled || !enabled) {
      this.isEnabled = enabled
      console.log(`震动功能${enabled ? '已启用' : '已禁用'}${isManual ? ' (手动设置)' : ' (自动同步)'}`)
    }
  }

  /**
   * 与音频管理器同步状态
   * @param {Object} audioManager - 音频管理器实例
   */
  syncWithAudioManager(audioManager) {
    if (!audioManager) return
    
    // 检查音频是否完全关闭
    const isAudioEnabled = audioManager.musicEnabled && audioManager.soundEnabled && !audioManager.musicPaused
    const hasAudioVolume = audioManager.masterVolume > 0
    
    // 只有当音频启用且有音量时才启用震动（除非手动禁用）
    const shouldEnable = isAudioEnabled && hasAudioVolume && !this.isManuallyDisabled
    
    if (this.isEnabled !== shouldEnable) {
      this.isEnabled = shouldEnable
      console.log(`震动状态已与音频同步: ${this.isEnabled ? '启用' : '禁用'} (音频启用: ${isAudioEnabled}, 音量: ${audioManager.masterVolume})`)
    }
  }

  /**
   * 执行震动
   * @param {number|Array} pattern - 震动模式，可以是单个数字或数组
   */
  vibrate(pattern) {
    if (!this.isSupported) {
      console.log('设备不支持震动功能')
      return false
    }

    if (!this.isEnabled) {
      console.log('震动功能已被禁用')
      return false
    }

    try {
      navigator.vibrate(pattern)
      console.log(`震动执行: ${Array.isArray(pattern) ? pattern.join(',') : pattern}ms`)
      return true
    } catch (error) {
      console.error('震动执行失败:', error)
      return false
    }
  }

  /**
   * 轻微震动 - 收集星星时使用
   * 短促轻快的震动，给予愉悦的收集反馈
   */
  lightVibration() {
    // 轻快的单次震动，持续50毫秒
    return this.vibrate(50)
  }

  /**
   * 中等震动 - 收集道具时使用
   * 比星星稍强，但仍然是正面反馈
   */
  mediumVibration() {
    // 稍长的震动，持续80毫秒
    return this.vibrate(80)
  }

  /**
   * 重度震动 - 碰撞障碍物时使用
   * 强烈的震动，给予警示反馈
   */
  heavyVibration() {
    // 强烈的震动模式：震动100ms，停止50ms，再震动100ms
    return this.vibrate([100, 50, 100])
  }

  /**
   * 游戏结束震动 - 失去生命或游戏结束时使用
   * 最强烈的震动，表示重要事件
   */
  gameOverVibration() {
    // 长时间的强烈震动：震动200ms，停止100ms，震动200ms，停止100ms，震动200ms
    return this.vibrate([200, 100, 200, 100, 200])
  }

  /**
   * 停止震动
   */
  stop() {
    if (!this.isSupported) return false
    
    try {
      navigator.vibrate(0)
      console.log('震动已停止')
      return true
    } catch (error) {
      console.error('停止震动失败:', error)
      return false
    }
  }

  /**
   * 测试震动功能
   */
  test() {
    console.log('开始测试震动功能...')
    
    if (!this.isSupported) {
      console.log('❌ 设备不支持震动功能')
      return
    }

    console.log('✅ 设备支持震动功能')
    console.log('测试轻微震动...')
    setTimeout(() => this.lightVibration(), 500)
    
    console.log('测试中等震动...')
    setTimeout(() => this.mediumVibration(), 1500)
    
    console.log('测试重度震动...')
    setTimeout(() => this.heavyVibration(), 2500)
  }

  /**
   * 销毁震动管理器
   */
  destroy() {
    if (this.volumeCheckInterval) {
      clearInterval(this.volumeCheckInterval)
      this.volumeCheckInterval = null
    }
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    
    console.log('震动管理器已销毁')
  }
}

// 创建全局震动管理器实例
const vibrationManager = new VibrationManager()

// 导出震动管理器和便捷方法
export default vibrationManager

// 导出便捷方法
export const {
  lightVibration,
  mediumVibration, 
  heavyVibration,
  gameOverVibration,
  setEnabled: setVibrationEnabled,
  stop: stopVibration,
  test: testVibration,
  syncWithAudioManager
} = vibrationManager 