import { defineStore } from 'pinia'
import { isQQNews } from '../utils/ua'
import { getOrCreateDeviceId } from '../utils/device'
import { getAppInfo, isLogin, setActionBtnStyle } from '@tencent/qqnews-jsapi'

console.log('[userStore.js] Module loading...') // Log at module level

/**
 * 用户环境信息存储
 * 用于存储用户环境相关信息，如是否在APP内打开等
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    // 是否在腾讯新闻APP内打开
    isInQQNewsApp: false,
    // 用户代理
    userAgent: '',
    // 设备ID (端外获取)
    deviceId: null,
    // QIMEI36 (端内获取)
    qimei36: null,
    // 是否登录 (端内获取)
    hasLogin: false,
    // 今天玩游戏的次数
    todayPlayCount: 0,
    // 上次玩游戏的日期 (YYYY-MM-DD)
    lastPlayDate: '',
    // 今天通过分享获得的额外游戏次数
    bonusPlaysGrantedToday: 0,
    // 上次授予奖励的日期 (YYYY-MM-DD)
    lastBonusGrantDate: ''
  }),

  getters: {
    /**
     * 用户每日最大允许游戏次数
     */
    maxPlaysAllowed(state) {
      return state.isInQQNewsApp ? 5 : 3;
    },
    /**
     * 用户今日剩余可玩次数
     */
    remainingPlays(state) {
      // This can be negative if todayPlayCount exceeds (maxPlaysAllowed + bonusPlaysGrantedToday)
      return (this.maxPlaysAllowed + state.bonusPlaysGrantedToday) - state.todayPlayCount;
    },
    /**
     * 用户是否可以玩游戏 (当前仅用于日志)
     */
    canPlay(state) {
      return this.remainingPlays > 0;
    },
    /**
     * 用户是否需要通过分享获取更多次数 (当前仅用于日志)
     * (可以增加一个单日奖励上限的判断，例如 state.bonusPlaysGrantedToday < DAILY_BONUS_LIMIT)
     */
    needsToShareForPlays(state) {
      return state.todayPlayCount >= this.maxPlaysAllowed;
    }
  },

  actions: {
    /**
     * 从 localStorage 加载游戏次数相关数据并处理每日重置逻辑
     */
    loadPlayCountFromLocalStorage() {
      if (typeof window !== 'undefined' && window.localStorage) {
        const d = new Date(); // 获取当前本地时间
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // getMonth() 返回 0-11
        const day = String(d.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;

        // 处理每日游戏次数
        const storedPlayDate = localStorage.getItem('pingpong_lastPlayDate');
        const storedPlayCount = localStorage.getItem('pingpong_todayPlayCount');
        if (storedPlayDate === today) {
          this.lastPlayDate = storedPlayDate;
          this.todayPlayCount = storedPlayCount ? parseInt(storedPlayCount, 10) : 0;
        } else {
          this.lastPlayDate = today;
          this.todayPlayCount = 0;
          localStorage.setItem('pingpong_lastPlayDate', this.lastPlayDate);
          localStorage.setItem('pingpong_todayPlayCount', this.todayPlayCount.toString());
        }
        console.log(`[userStore] Loaded todayPlayCount: ${this.todayPlayCount}, lastPlayDate: ${this.lastPlayDate}`);

        // 处理每日奖励次数
        const storedBonusDate = localStorage.getItem('pingpong_lastBonusGrantDate');
        const storedBonusCount = localStorage.getItem('pingpong_bonusPlaysGrantedToday');
        if (storedBonusDate === today) {
          this.lastBonusGrantDate = storedBonusDate;
          this.bonusPlaysGrantedToday = storedBonusCount ? parseInt(storedBonusCount, 10) : 0;
        } else {
          this.lastBonusGrantDate = today;
          this.bonusPlaysGrantedToday = 0;
          localStorage.setItem('pingpong_lastBonusGrantDate', this.lastBonusGrantDate);
          localStorage.setItem('pingpong_bonusPlaysGrantedToday', this.bonusPlaysGrantedToday.toString());
        }
        console.log(`[userStore] Loaded bonusPlaysGrantedToday: ${this.bonusPlaysGrantedToday}, lastBonusGrantDate: ${this.lastBonusGrantDate}`);
        this.logCurrentPlayStats('[After loadPlayCountFromLocalStorage]');
      }
    },

    /**
     * 增加今日游戏次数
     */
    incrementTodayPlayCount() {
      if (typeof window !== 'undefined' && window.localStorage) {
        const d = new Date(); // 获取当前本地时间
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // getMonth() 返回 0-11
        const day = String(d.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        // 确保日期是最新的，以防万一 loadPlayCountFromLocalStorage 未在某些边缘情况下正确运行
        if (this.lastPlayDate !== today) {
          this.lastPlayDate = today;
          this.todayPlayCount = 0; 
        }
        this.todayPlayCount++;
        localStorage.setItem('pingpong_lastPlayDate', this.lastPlayDate);
        localStorage.setItem('pingpong_todayPlayCount', this.todayPlayCount.toString());
        console.log(`[userStore] Incremented todayPlayCount to: ${this.todayPlayCount}`);
        this.logCurrentPlayStats('[After incrementTodayPlayCount]');
      }
    },
    
    /**
     * 授予用户额外游戏次数
     * @param {number} playsAmount 授予的次数
     */
    grantBonusPlays(playsAmount) {
      if (typeof window !== 'undefined' && window.localStorage && playsAmount > 0) {
        const d = new Date(); // 获取当前本地时间
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // getMonth() 返回 0-11
        const day = String(d.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        // 确保日期是最新的
        if (this.lastBonusGrantDate !== today) {
          this.lastBonusGrantDate = today;
          this.bonusPlaysGrantedToday = 0; // 新的一天，重置今日已获得的奖励次数
        }
        this.bonusPlaysGrantedToday += playsAmount;
        localStorage.setItem('pingpong_lastBonusGrantDate', this.lastBonusGrantDate);
        localStorage.setItem('pingpong_bonusPlaysGrantedToday', this.bonusPlaysGrantedToday.toString());
        console.log(`[userStore] Granted ${playsAmount} bonus plays. Total bonus today: ${this.bonusPlaysGrantedToday}`);
        this.logCurrentPlayStats(`[After grantBonusPlays(${playsAmount})]`);
      }
    },

    /**
     * 辅助函数：打印当前游戏次数相关的统计信息
     * @param {string} contextMessage 日志上下文消息
     */
    logCurrentPlayStats(contextMessage = '') {
      console.log(`%c[userStore Play Stats] ${contextMessage}`, 'color: blue; font-weight: bold;', {
        isInQQNewsApp: this.isInQQNewsApp,
        todayPlayCount: this.todayPlayCount,
        lastPlayDate: this.lastPlayDate,
        bonusPlaysGrantedToday: this.bonusPlaysGrantedToday,
        lastBonusGrantDate: this.lastBonusGrantDate,
        maxPlaysAllowed: this.maxPlaysAllowed,
        remainingPlays: this.remainingPlays,
        canPlay: this.canPlay,
        needsToShareForPlays: this.needsToShareForPlays
      });
    },

    /**
     * 模拟用户分享并授予奖励次数 (用于测试)
     * @param {boolean} isTriggeredFromAppEnv  - 如果模拟的是App环境下的分享，则为true
     */
    simulateShareAndGrantBonus(isTriggeredFromAppEnv = false) {
      console.log(`%c[userStore] Simulating share action... (isAppEnv: ${isTriggeredFromAppEnv})`, 'color: green; font-weight: bold;');
      // 根据环境确定奖励次数
      const bonusAmount = isTriggeredFromAppEnv ? 5 : 3;
      this.grantBonusPlays(bonusAmount);
      // grantBonusPlays 内部已经调用了 logCurrentPlayStats
    },

    /**
     * 初始化用户环境信息
     */
    async initEnvironment() {
      console.log('[userStore] initEnvironment function called')
      this.loadPlayCountFromLocalStorage(); // 在初始化时加载次数
      if (typeof window !== 'undefined') {
        this.userAgent = window.navigator.userAgent
        console.log('[userStore] userAgent set:', this.userAgent)

        // 开发模式下强制为 true
        if (process.env.NODE_ENV === 'development') {
          this.isInQQNewsApp = true; // 开发模式下强制为 true
          console.warn('[Dev Mode] isInQQNewsApp has been forced to true in userStore.initEnvironment');
        } else {
          this.isInQQNewsApp = isQQNews()
        }
        // 开发模式下强制为 true 结束
        this.isInQQNewsApp = isQQNews()

        console.log('[userStore] isInQQNewsApp set:', this.isInQQNewsApp)
        
        try {
          this.deviceId = getOrCreateDeviceId()
          console.log('[userStore] deviceId set:', this.deviceId)
        } catch (error) {
          console.error('[userStore] Error getting deviceId:', error)
          this.deviceId = 'error-getting-deviceId' 
        }
        
        if (this.isInQQNewsApp) {
          console.log('[userStore] In QQNews App, attempting to get app info...')
          try {
            // 设置分享按钮样式
            setActionBtnStyle({
              type: 1,
            });
            console.log('[userStore] setActionBtnStyle called for QQNews App');

            const appInfo = await getAppInfo()
            this.qimei36 = appInfo.QIMEI36
            console.log('[userStore] qimei36 set:', this.qimei36)
            
            const loginStatus = await isLogin()
            this.hasLogin = loginStatus.hasLogin
            console.log('[userStore] hasLogin set:', this.hasLogin)
          } catch (error) {
            console.error('[userStore] Error fetching QQNews App info:', error)
            this.qimei36 = null 
            this.hasLogin = false 
          }
        }
        
        console.log('用户数据收集完成 (User Data Collected - All Restored):', { 
          userAgent: this.userAgent, 
          isInQQNewsApp: this.isInQQNewsApp,
          deviceId: this.deviceId,
          qimei36: this.qimei36, 
          hasLogin: this.hasLogin 
        })
      } else {
        console.log('[userStore] window is undefined, skipping initEnvironment')
      }
    }
  }
})

console.log('[userStore.js] Module fully parsed.') // Log at module end 