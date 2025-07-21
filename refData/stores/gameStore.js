// 导入 Pinia 的核心 API
import { defineStore } from 'pinia'
import { PowerUpTypes } from '../game/powerUpTypes' // 导入道具类型
import { TrophyTypes } from '../game/trophyTypes' // 导入奖杯类型
import { useUserStore } from './userStore' // 导入 userStore

/**
 * 游戏状态管理 Store
 * 负责管理整个游戏的状态、场景切换、游戏进度、音频、道具和奖杯系统
 */
export const useGameStore = defineStore('game', {
  /**
   * 状态定义
   */
  state: () => ({
    // --- 基础游戏状态 ---
    currentScene: 'loading', // 当前场景：loading, intro, game, ending
    gameStatus: 'idle',      // 游戏状态：idle, playing, paused, ended
    isGamePaused: false,     // 游戏是否暂停
    
    // --- 关卡相关状态 ---
    currentLevelId: 0,        // 当前关卡ID，0表示未开始
    currentLevelDescription: '', // 当前关卡描述
    targetCups: 0,            // 当前关卡目标杯子数
    fallenCupsCount: 0,       // 当前关卡已掉落杯子数
    remainingTime: 0,         // 当前关卡剩余时间(秒)
    totalFallenCupsThisSession: 0, // 本局游戏会话总击落杯子数
    isLevelTransitionBannerVisible: false, // 关卡过渡横幅是否可见
    
    // --- 资源加载状态 ---
    resources: {
      loaded: false, // 是否加载完成
      total: 0,      // 总共需要加载的资源数量
      current: 0     // 当前已加载的资源数量
    },
    
    // --- 音频状态 ---
    audioContext: null,
    bgmBuffer: null,
    bgmSourceNode: null,
    bgmGainNode: null,
    isBgmPlaying: false,
    masterVolume: 0.5, // 主音量 (0 to 1)
    isMuted: false,    // 全局静音状态
    _audioContextInitialized: false, // 新增：音频系统是否已初始化
    _audioContextCanPlay: false,   // 新增：音频上下文是否可以播放 (state === 'running')
    _bgmShouldBePlaying: false,    // 新增：BGM 是否应该在播放（用于上下文恢复后自动播放）
    
    // --- 道具状态 ---
    activePowerUps: [], // 存储当前激活的道具对象
    powerUpNotification: { 
      visible: false, 
      message: '', 
      type: null 
    },
    
    // --- 奖杯状态 ---
    sessionTrophiesEarned: [],    // 本局游戏获得的奖杯
    sessionBallsUsed: 0,          // 本局游戏使用的球数
    sessionLevelsCompleted: 0,    // 本局游戏完成的关卡数
    ballsUsedInCurrentLevel: 0,   // 当前关卡使用的球数
    trophyNotification: {         // 新增：奖杯通知状态
      visible: false,
      trophyId: null,
      icon: ''
    },
  }),

  /**
   * 计算属性
   */
  getters: {
    // 计算加载进度百分比
    loadingProgress: (state) => {
      if (state.resources.total === 0) return 0
      return Math.floor((state.resources.current / state.resources.total) * 100)
    },

    /**
     * 生成 API 格式的奖杯状态对象
     * 例如：{ "CUP_COLLECTOR_20": 0, "METAL_BUSTER": 1, ... }
     * 键是 TrophyTypes.js 中定义的奖杯ID (也是 TrophyTypes 对象中的键名和值)
     */
    apiTrophiesStatusObject: (state) => {
      const trophiesReport = {};
      // Iterate over the keys/values of TrophyTypes to ensure all defined trophies are included
      for (const trophyIdKey in TrophyTypes) {
        const trophyIdValue = TrophyTypes[trophyIdKey]; // This is the actual string ID like 'CUP_COLLECTOR_20'
        trophiesReport[trophyIdValue] = state.sessionTrophiesEarned.includes(trophyIdValue) ? 1 : 0;
      }
      return trophiesReport;
    }
  },

  /**
   * 操作方法
   */
  actions: {
    //====================================
    // 场景与游戏状态管理
    //====================================
    
    /**
     * 切换场景
     * @param {string} sceneName 场景名称
     */
    setScene(sceneName) {
      this.currentScene = sceneName
    },
    
    /**
     * 开始游戏
     */
    async startGame() { // Make async
      const userStore = useUserStore(); 
      userStore.logCurrentPlayStats('[Before startGame]');

      // 标记BGM应该播放
      this._bgmShouldBePlaying = true; 
      
      // 开始游戏是明确的用户交互，尝试解锁音频并播放BGM
      const canPlay = await this.attemptUnlockAndResumeAudio();
      if (canPlay) {
        console.log('[startGame] Audio context can play, attempting to play BGM.');
        await this.playBGM();
      } else {
        console.warn('[startGame] Audio context not ready after unlock attempt. BGM play will be deferred.');
        // playBGM 内部也会将 _bgmShouldBePlaying 设为 true，并等待 onstatechange
      }

      this.gameStatus = 'playing'
      this.setScene('game')
    },
    
    /**
     * 暂停游戏
     */
    pauseGame() {
      this.isGamePaused = true
      this.gameStatus = 'paused'
    },
    
    /**
     * 继续游戏
     */
    resumeGame() {
      this.isGamePaused = false
      this.gameStatus = 'playing'
    },
    
    /**
     * 结束游戏
     */
    endGame() {
      const userStore = useUserStore(); 
      userStore.incrementTodayPlayCount(); 
      // userStore.logCurrentPlayStats('[After endGame processing]'); // incrementTodayPlayCount already logs
      this.gameStatus = 'ended'
      this.setScene('ending')
    },
    
    /**
     * 重新开始游戏
     */
    restartGame() {
      const userStore = useUserStore(); 
      userStore.logCurrentPlayStats('[Before restartGame]'); // Log stats

      // 重置所有游戏状态
      this.gameStatus = 'playing'
      this.isGamePaused = false
      this.currentLevelId = 0
      this.fallenCupsCount = 0
      this.targetCups = 0
      this.remainingTime = 0
      this.totalFallenCupsThisSession = 0
      this.clearAllPowerUps()

      // 重置奖杯相关状态
      this.sessionTrophiesEarned = []
      this.sessionBallsUsed = 0
      this.sessionLevelsCompleted = 0

      // 切换场景，让 Game.js 加载 level 1
      this.setScene('game')
    },
    
    /**
     * 更新资源加载进度
     * @param {number} current 当前已加载数量
     * @param {number} total 总数量
     */
    updateLoadingProgress(current, total) {
      this.resources.current = current
      this.resources.total = total
      // 当加载完成时，自动进入介绍场景
      if (current === total) {
        this.resources.loaded = true
        this.setScene('intro')
      }
    },

    //====================================
    // 关卡管理
    //====================================
    
    /**
     * 设置当前关卡信息
     * @param {object} levelData 关卡数据 { id, targetCups, timeLimitSeconds }
     */
    setLevel(levelData) {
      this.currentLevelId = levelData.id
      this.targetCups = levelData.targetCups
      this.fallenCupsCount = 0
      this.remainingTime = levelData.timeLimitSeconds ?? 60
      
      // 加载并设置关卡描述
      this.loadLevelDescription(this.currentLevelId)
      
      // 重置当前关卡使用的球数
      this.ballsUsedInCurrentLevel = 0
    },
    
    /**
     * 加载关卡描述
     * @param {number} levelId 关卡ID
     */
    async loadLevelDescription(levelId) {
      if (!levelId || levelId === 0) {
        this.currentLevelDescription = ''
        return
      }
      try {
        const levelModule = await import(`../game/levels/level${levelId}.js`)
        this.currentLevelDescription = levelModule.default?.description || ''
      } catch (error) {
        console.error(`Failed to load description for level ${levelId}:`, error)
        this.currentLevelDescription = ''
      }
    },
    
    /**
     * 减少剩余时间
     */
    decrementTime() {
      if (this.remainingTime > 0) {
        this.remainingTime--
      }
    },
    
    /**
     * 增加剩余时间
     * @param {number} amount 增加的时间(秒)
     */
    increaseRemainingTime(amount) {
      this.remainingTime += amount
    },
    
    /**
     * 减少剩余时间
     * @param {number} amount 减少的时间(秒)
     */
    decreaseRemainingTimeByAmount(amount) {
      this.remainingTime = Math.max(0, this.remainingTime - amount)
    },
    
    /**
     * 显示关卡过渡横幅
     */
    showLevelTransitionBanner() {
      this.isLevelTransitionBannerVisible = true
    },
    
    /**
     * 隐藏关卡过渡横幅
     */
    hideLevelTransitionBanner() {
      this.isLevelTransitionBannerVisible = false
    },
    
    /**
     * 增加掉落杯子计数
     */
    incrementFallenCups() {
      // 只有在游戏中才计数
      if (this.gameStatus === 'playing') {
        this.fallenCupsCount++ // 本关计数
        this.totalFallenCupsThisSession++ // 本局总数计数

        // 检查是否达到获取奖杯的条件
        if (this.totalFallenCupsThisSession >= 20 && !this.sessionTrophiesEarned.includes(TrophyTypes.CUP_COLLECTOR_20)) {
          this.awardTrophy(TrophyTypes.CUP_COLLECTOR_20)
        }
        if (this.totalFallenCupsThisSession >= 100 && !this.sessionTrophiesEarned.includes(TrophyTypes.CUP_COLLECTOR_100)) {
          this.awardTrophy(TrophyTypes.CUP_COLLECTOR_100)
        }
        if (this.totalFallenCupsThisSession >= 450 && !this.sessionTrophiesEarned.includes(TrophyTypes.CUP_COLLECTOR_300)) {
          this.awardTrophy(TrophyTypes.CUP_COLLECTOR_300)
        }
      }
    },

    //====================================
    // 道具系统
    //====================================
    
    /**
     * 处理玩家获得道具
     * @param {string} powerUpType 道具类型
     * @param {object} options 选项 { appliedImmediately, appliesToNextBall }
     */
    playerAcquiredPowerUp(powerUpType, options = {}) {
      // 球体修改类道具处理
      if (powerUpType === PowerUpTypes.BIG_BALL ||
          powerUpType === PowerUpTypes.SMALL_BALL ||
          powerUpType === PowerUpTypes.HEAVY_BALL ||
          powerUpType === PowerUpTypes.CURVE_BALL_LEFT ||
          powerUpType === PowerUpTypes.CURVE_BALL_RIGHT) {

        if (options.appliedImmediately) {
          // 已立即应用到当前球
        } else if (options.appliesToNextBall) {
          // 避免同类型道具重复添加
          if (!this.activePowerUps.some(p => p.type === powerUpType && p.appliesToNextBall)) {
            this.activePowerUps.push({
              type: powerUpType,
              acquiredTime: Date.now(),
              appliesToNextBall: true,
            })
          }
        }

        // 显示对应道具通知
        if (powerUpType === PowerUpTypes.HEAVY_BALL) {
          this.showPowerUpNotification('获得超重乒乓球道具，只有金属杯子拦得住！', PowerUpTypes.HEAVY_BALL)
        } else if (powerUpType === PowerUpTypes.BIG_BALL) {
          this.showPowerUpNotification('获得超大乒乓球道具！', PowerUpTypes.BIG_BALL)
        } else if (powerUpType === PowerUpTypes.SMALL_BALL) {
          this.showPowerUpNotification('获得迷你乒乓球道具！', PowerUpTypes.SMALL_BALL)
        } else if (powerUpType === PowerUpTypes.CURVE_BALL_LEFT) {
          this.showPowerUpNotification('获得左弧线球！球会向左偏转！', PowerUpTypes.CURVE_BALL_LEFT)
        } else if (powerUpType === PowerUpTypes.CURVE_BALL_RIGHT) {
          this.showPowerUpNotification('获得右弧线球！球会向右偏转！', PowerUpTypes.CURVE_BALL_RIGHT)
        }
      }
      // 时间修改类道具处理
      else if (powerUpType === PowerUpTypes.INCREASE_TIME) {
        this.increaseRemainingTime(5)
        this.showPowerUpNotification('获得增加时间道具！剩余时间 +5s', PowerUpTypes.INCREASE_TIME)
      } else if (powerUpType === PowerUpTypes.DECREASE_TIME) {
        this.decreaseRemainingTimeByAmount(5)
        this.showPowerUpNotification('获得减少时间道具！剩余时间 -5s', PowerUpTypes.DECREASE_TIME)
      } else {
        // 其他未知道具类型处理
        if (powerUpType !== PowerUpTypes.METAL_CUP) {
            console.warn(`[GameStore] playerAcquiredPowerUp: 未处理的道具类型: ${powerUpType}`)
        }
      }
    },
    
    /**
     * 消耗适用于下一个球的道具
     * @param {string} powerUpType 道具类型
     */
    consumeNextBallPowerUp(powerUpType) {
      const index = this.activePowerUps.findIndex(p => p.type === powerUpType && p.appliesToNextBall)
      if (index !== -1) {
        this.activePowerUps.splice(index, 1)
      }
    },
    
    /**
     * 清除所有道具
     */
    clearAllPowerUps() {
      this.activePowerUps = []
      this.powerUpNotification.visible = false
      this.powerUpNotification.message = ''
      this.powerUpNotification.type = null
    },
    
    /**
     * 显示道具通知
     * @param {string} message 通知消息
     * @param {string} type 道具类型
     */
    showPowerUpNotification(message, type) {
      this.powerUpNotification.message = message
      this.powerUpNotification.type = type
      this.powerUpNotification.visible = true

      setTimeout(() => {
        this.powerUpNotification.visible = false
        this.powerUpNotification.type = null
      }, 3000)
    },

    //====================================
    // 奖杯系统
    //====================================
    
    /**
     * 授予奖杯
     * @param {string} trophyId 奖杯ID
     */
    awardTrophy(trophyId) {
      if (!this.sessionTrophiesEarned.includes(trophyId)) {
        this.sessionTrophiesEarned.push(trophyId)
        console.log(`[GameStore] Trophy Awarded: ${trophyId}`)
        console.log(`[GameStore] Current Trophies:`, JSON.stringify(this.sessionTrophiesEarned))
        
        // 更新奖杯通知状态以触发动画
        let iconPath = '';
        if (trophyId === TrophyTypes.CUP_COLLECTOR_20) {
          iconPath = 'assets/trophy/cupFall20.png';
        } else if (trophyId === TrophyTypes.CUP_COLLECTOR_100) {
          iconPath = 'assets/trophy/cupFall100.png';
        } else if (trophyId === TrophyTypes.CUP_COLLECTOR_300) {
          iconPath = 'assets/trophy/cupFall300.png';
        } else if (trophyId === TrophyTypes.METAL_BUSTER) {
          iconPath = 'assets/trophy/cupMetalFall.png';
        } else if (trophyId === TrophyTypes.ONE_SHOT_CLEAR) {
          iconPath = 'assets/trophy/cupOneshot.png';
        } else if (trophyId === TrophyTypes.LEVEL_CONQUEROR_5) {
          iconPath = 'assets/trophy/cupPass5.png';
        }

        if (iconPath) {
          this.trophyNotification.trophyId = trophyId;
          this.trophyNotification.icon = iconPath;
          this.trophyNotification.visible = true;
          // 动画结束后自动隐藏 (动画总时长 2.1s)
          setTimeout(() => {
            this.trophyNotification.visible = false;
            this.trophyNotification.trophyId = null;
            this.trophyNotification.icon = '';
          }, 2100); 
        }

      } else {
        console.log(`[GameStore] Trophy ${trophyId} already earned this session.`)
      }
    },
    
    /**
     * 增加使用的球数计数
     */
    incrementBallsUsed() {
      if (this.gameStatus === 'playing') {
        this.sessionBallsUsed++
        this.ballsUsedInCurrentLevel++
      }
    },
    
    /**
     * 增加完成的关卡数计数
     */
    incrementLevelsCompleted() {
      if (this.gameStatus === 'playing') {
        this.sessionLevelsCompleted++
        console.log(`[GameStore] Levels completed this session: ${this.sessionLevelsCompleted}`)
        
        // 检查关卡征服者奖杯
        if (this.sessionLevelsCompleted === 5) {
          this.awardTrophy(TrophyTypes.LEVEL_CONQUEROR_5)
          console.log(`[🏆Trophy] 恭喜！你获得了"关卡征服者"奖杯！累计通过5个关卡！`)
        }
        
        // 检查一球通关奖杯
        if (this.ballsUsedInCurrentLevel === 1) {
          this.awardTrophy(TrophyTypes.ONE_SHOT_CLEAR)
          console.log(`[🏆Trophy] 太厉害了！你获得了"一球通关"奖杯！仅用一球就通过了关卡${this.currentLevelId}！`)
        }
      }
    },

    //====================================
    // 音频系统
    //====================================
    
    /**
     * 初始化音频系统 (应该在应用加载早期被调用一次)
     */
    initializeAudioSystem() {
      if (this._audioContextInitialized) {
        return;
      }
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.bgmGainNode = this.audioContext.createGain();
        this.bgmGainNode.connect(this.audioContext.destination);
        this._audioContextInitialized = true;
        this._audioContextCanPlay = this.audioContext.state === 'running';

        this.audioContext.onstatechange = async () => { // Make async to await playBGM
          console.log('[AudioContext] State changed to:', this.audioContext.state);
          this._audioContextCanPlay = this.audioContext.state === 'running';
          if (this._audioContextCanPlay) {
            this._updateBgmVolume(); 
            if (this._bgmShouldBePlaying && !this.isBgmPlaying) {
              console.log('[AudioContext] statechange: Context running, should play BGM, attempting to play.');
              await this.playBGM(); // Ensure BGM plays if it was supposed to
            }
          }
        };
        
        // 使用一个标志来避免重复绑定
        if (!window._gameStoreVisibilityListenerAttached) {
            document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
            window._gameStoreVisibilityListenerAttached = true;
        }

        this._updateBgmVolume(); // Initialize volume based on current state

        console.log('[AudioSystem] Initialized. Context state:', this.audioContext.state);
      } catch (e) {
        console.error("Failed to initialize AudioContext:", e);
        this._audioContextInitialized = false;
      }
    },

    /**
     * 尝试解锁/恢复音频上下文。应由用户手势触发。
     */
    async attemptUnlockAndResumeAudio() {
      if (!this._audioContextInitialized) {
        this.initializeAudioSystem(); // 确保已初始化
      }
      if (!this.audioContext) {
        console.warn('[AudioSystem] Cannot unlock, AudioContext not created.');
        return false;
      }

      if (this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume();
          console.log('[AudioSystem] AudioContext.resume() called. State after resume:', this.audioContext.state);
          // onstatechange 会处理后续逻辑和 _audioContextCanPlay 的更新
        } catch (e) {
          console.error('Error resuming AudioContext:', e);
        }
      }
      // 直接更新 _audioContextCanPlay，因为 onstatechange 可能是异步的
      this._audioContextCanPlay = this.audioContext.state === 'running';
      return this._audioContextCanPlay;
    },
    
    /**
     * 更新背景音乐音量
     */
    _updateBgmVolume() {
      if (this.bgmGainNode && this.audioContext) {
        const targetVolume = this.isMuted ? 0 : this.masterVolume;
        // 如果 context 不是 running，直接设置 gain.value，它会在 context 恢复时生效
        if (this.audioContext.state === 'running') {
           this.bgmGainNode.gain.setValueAtTime(targetVolume, this.audioContext.currentTime);
        } else {
           this.bgmGainNode.gain.value = targetVolume;
        }
      }
    },
    
    /**
     * 设置主音量
     * @param {number} volume 音量值(0-1)
     */
    setMasterVolume(volume) {
      this.masterVolume = Math.max(0, Math.min(1, volume));
      this._updateBgmVolume();
    },
    
    /**
     * 切换静音状态
     */
    async toggleMute() {
      this.isMuted = !this.isMuted;
      console.log('[AudioSystem] Toggle Mute. New state: isMuted =', this.isMuted);
      this._updateBgmVolume(); // 首先更新音量

      if (!this.isMuted) {
        // 取消静音是用户手势，尝试解锁并恢复音频
        const canPlay = await this.attemptUnlockAndResumeAudio();
        // 如果 audio 现在可以播放了，并且BGM应该播放但没在放，则启动BGM
        if (canPlay && this._bgmShouldBePlaying && !this.isBgmPlaying) {
          console.log('[AudioSystem] Unmuted, BGM should be playing, context is ready. Attempting to play BGM.');
          await this.playBGM();
        }
      }
      // 如果是静音，BGM 音量已设为0，播放会“静默”进行，无需停止/启动声源节点
    },
    
    /**
     * 加载音频缓冲
     * @param {string} url 音频文件URL
     */
    async _loadAudioBuffer(url) {
      if (!this._audioContextInitialized || !this.audioContext) {
        console.error("AudioContext not initialized for _loadAudioBuffer. Attempting init.");
        this.initializeAudioSystem(); // 尝试初始化
        if (!this.audioContext) {
          console.error("AudioContext failed to initialize during _loadAudioBuffer.");
          return null;
        }
      }
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
      } catch (error) {
        console.error(`Error loading audio buffer from ${url}:`, error);
        return null;
      }
    },
    
    /**
     * 播放背景音乐
     */
    async playBGM() {
      if (!this._audioContextInitialized) {
        this.initializeAudioSystem();
      }
      
      if (!this.audioContext) {
        console.warn('[BGM] AudioContext not available. Cannot play BGM.');
        this._bgmShouldBePlaying = true; // 标记意图，以便后续恢复
        return;
      }

      // 如果音频上下文未运行，标记意图并等待 onstatechange 或用户交互
      if (this.audioContext.state !== 'running') {
        console.warn(`[BGM] AudioContext not 'running' (state: ${this.audioContext.state}). Deferring BGM play. Marking _bgmShouldBePlaying = true.`);
        this._bgmShouldBePlaying = true;
        // 尝试恢复，这可能不是由用户手势直接触发，作为安全网
        await this.attemptUnlockAndResumeAudio(); 
        if(this.audioContext.state !== 'running') return; // 如果尝试后仍未运行，则明确推迟
      }

      this._bgmShouldBePlaying = true; // 明确意图是要播放 BGM
      this._updateBgmVolume(); // 确保音量已更新

      if (this.isBgmPlaying && this.bgmSourceNode) {
        console.log('[BGM] Already playing or source node exists and is marked as playing.');
        return;
      }

      if (!this.bgmBuffer) {
        const bgmPath = 'assets/sounds/bgm.mp3';
        this.bgmBuffer = await this._loadAudioBuffer(bgmPath);
        if (!this.bgmBuffer) {
          console.error("[BGM] Buffer could not be loaded. Cannot play BGM.");
          this._bgmShouldBePlaying = false; // 加载失败，清除意图
          return;
        }
      }

      // 清理任何已存在的声源节点
      if (this.bgmSourceNode) {
        try { this.bgmSourceNode.stop(0); } catch (e) { /* ignore */ }
        this.bgmSourceNode.disconnect();
        this.bgmSourceNode = null;
      }

      this.bgmSourceNode = this.audioContext.createBufferSource();
      this.bgmSourceNode.buffer = this.bgmBuffer;
      this.bgmSourceNode.loop = true;
      this.bgmSourceNode.connect(this.bgmGainNode);
      
      try {
        this.bgmSourceNode.start(0);
        this.isBgmPlaying = true;
        console.log("[BGM] Playback started successfully.");
      } catch (error) {
        console.error("Error starting BGM:", error);
        this.isBgmPlaying = false;
        // _bgmShouldBePlaying 保持 true，以便 onstatechange 或下次交互时重试
      }
    },
    
    /**
     * 停止背景音乐
     */
    stopBGM() {
      this._bgmShouldBePlaying = false; // 用户或系统明确希望BGM停止
      if (this.bgmSourceNode) {
        try {
          this.bgmSourceNode.stop(0);
          this.bgmSourceNode.disconnect();
        } catch (e) { /* 忽略已停止的错误 */ }
        this.bgmSourceNode = null; // 清理声源节点
      }
      this.isBgmPlaying = false;
      console.log("[BGM] Playback stopped.");
    },
    
    /**
     * 切换背景音乐播放状态
     */
    async toggleBGM() { 
      // 这是一个用户手势
      const canPlay = await this.attemptUnlockAndResumeAudio(); // 确保上下文已准备好

      if (this.isBgmPlaying) { // 如果正在播放（或认为正在播放）
        this.stopBGM(); // 这会将 _bgmShouldBePlaying 设为 false
      } else {
        // 如果未播放，用户希望播放它
        this._bgmShouldBePlaying = true; // 设置意图
        if (canPlay) { // 如果上下文已准备好
          await this.playBGM();
        } else {
          console.warn('[toggleBGM] Audio context not ready after unlock attempt. BGM play deferred.');
          // 如果上下文稍后通过 onstatechange 准备就绪，会自动播放
        }
      }
    },

    /**
     * >> 新增：处理页面可见性变化 <<
     */
    async handleVisibilityChange() {
      if (!this._audioContextInitialized || !this.audioContext) {
          console.warn('[VisibilityChange] Audio system not ready.');
          return;
      }

      if (document.visibilityState === 'visible') {
        console.log('[AudioSystem] Page is now visible. Attempting to resume audio.');
        const canPlay = await this.attemptUnlockAndResumeAudio(); 
        
        if (canPlay && this._bgmShouldBePlaying && !this.isBgmPlaying) {
          console.log('[AudioSystem] Resuming BGM: page visible, context runnable, BGM should play, not currently playing.');
          await this.playBGM();
        } else if (canPlay && this._bgmShouldBePlaying && this.isBgmPlaying){
           console.log('[AudioSystem] Page visible, BGM should be playing and IS marked as playing. Ensuring playback by calling playBGM.');
           // 调用 playBGM 以确保声源是最新的，即使 isBgmPlaying 为 true
           // playBGM 内部逻辑会处理是否真的需要重启
           await this.playBGM();
        } else {
            console.log(`[AudioSystem] Page visible. Conditions not met for BGM resume. CanPlay: ${canPlay}, ShouldPlay: ${this._bgmShouldBePlaying}, IsPlaying: ${this.isBgmPlaying}`);
        }

      } else if (document.visibilityState === 'hidden') {
        console.log('[AudioSystem] Page is now hidden. Audio will likely be suspended by browser.');
        // 不要改变 _bgmShouldBePlaying，因为如果之前在播放，回来时应该恢复
        if (this.isBgmPlaying && this.bgmSourceNode) {
          try { 
            this.bgmSourceNode.stop(0); 
            // Don't nullify sourceNode here, playBGM will handle recreation if needed
            // after verifying context state and isBgmPlaying status.
          } catch(e) { /* ignore error */ }
          this.isBgmPlaying = false; // 标记为未播放
          console.log('[BGM] Playback explicitly paused due to page hidden.');
        }
      }
    },
  }
})


import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    // 游泳游戏特有状态
    sessionDistance: 0,        // 本局游泳距离（米）
    sessionScore: 0,           // 本局得分（星星数）
    gameEndReason: '',         // 游戏结束原因
    earnedTrophies: [],        // 获得的奖杯
    currentLevel: 1,           // 当前关卡
    isGameActive: false,       // 游戏是否进行中
    gameStartTime: null,       // 游戏开始时间
    gameEndTime: null,         // 游戏结束时间
  }),
  
  getters: {
    gameDuration() {
      if (this.gameStartTime && this.gameEndTime) {
        return this.gameEndTime - this.gameStartTime;
      }
      return 0;
    },
    
    averageSpeed() {
      const duration = this.gameDuration / 1000; // 转换为秒
      if (duration > 0) {
        return (this.sessionDistance / duration).toFixed(2);
      }
      return 0;
    }
  },
  
  actions: {
    startGame() {
      this.isGameActive = true;
      this.gameStartTime = Date.now();
      this.sessionDistance = 0;
      this.sessionScore = 0;
      this.earnedTrophies = [];
      console.log('🏊‍♂️ 游泳游戏开始');
    },
    
    endGame(reason = 'completed') {
      this.isGameActive = false;
      this.gameEndTime = Date.now();
      this.gameEndReason = reason;
      console.log(`🏁 游泳游戏结束: ${reason}`);
      console.log(`📊 最终成绩 - 距离: ${this.sessionDistance}米, 得分: ${this.sessionScore}分`);
    },
    
    updateDistance(distance) {
      this.sessionDistance = Math.max(0, distance);
    },
    
    updateScore(score) {
      this.sessionScore = Math.max(0, score);
    },
    
    addScore(points = 1) {
      this.sessionScore += points;
    },
    
    addDistance(meters) {
      this.sessionDistance += meters;
    },
    
    earnTrophy(trophyType) {
      if (!this.earnedTrophies.includes(trophyType)) {
        this.earnedTrophies.push(trophyType);
        console.log(`🏆 获得奖杯: ${trophyType}`);
      }
    },
    
    resetGame() {
      this.sessionDistance = 0;
      this.sessionScore = 0;
      this.gameEndReason = '';
      this.earnedTrophies = [];
      this.isGameActive = false;
      this.gameStartTime = null;
      this.gameEndTime = null;
      console.log('🔄 游戏状态已重置');
    }
  }
});
