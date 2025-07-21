import { defineStore } from 'pinia'
import { isQQNews } from '../utils/ua.js'
import { getOrCreateDeviceId } from '../utils/device.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    deviceId: '',
    qimei36: '',
    hasLogin: false,
    isInQQNewsApp: false,
    userAgent: '',
    // 游泳游戏特有数据
    lastPlayDate: '',
    todayPlayCount: 0,
    maxDailyPlays: 3,
    lastBonusGrantDate: '',
    bonusPlaysGrantedToday: 0,
    maxBonusPlays: 2
  }),
  
  getters: {
    canPlayToday() {
      const today = new Date().toDateString();
      if (this.lastPlayDate !== today) {
        return true; // 新的一天，可以玩
      }
      return this.todayPlayCount < this.maxDailyPlays;
    },
    
    remainingPlaysToday() {
      const today = new Date().toDateString();
      if (this.lastPlayDate !== today) {
        return this.maxDailyPlays; // 新的一天
      }
      return Math.max(0, this.maxDailyPlays - this.todayPlayCount);
    }
  },
  
  actions: {
    async initEnvironment() {
      console.log('[userStore] 初始化游泳游戏环境');
      this.loadPlayCountFromLocalStorage();
      
      if (typeof window !== 'undefined') {
        this.userAgent = window.navigator.userAgent;
        
        // 开发模式下强制为 true（用于PC端调试）
        if (process.env.NODE_ENV === 'development') {
          this.isInQQNewsApp = true;
          console.warn('[Dev Mode] isInQQNewsApp 已强制设为 true');
        } else {
          this.isInQQNewsApp = isQQNews();
        }
        
        // 获取设备ID
        this.deviceId = getOrCreateDeviceId();
        
        // 如果在腾讯新闻APP内，获取APP特有信息
        if (this.isInQQNewsApp) {
          try {
            // 这里需要引入腾讯新闻JSAPI
            // const { setActionBtnStyle, getAppInfo, isLogin } = await import('@tencent/qqnews-jsapi');
            // setActionBtnStyle({ type: 1 });
            // const appInfo = await getAppInfo();
            // this.qimei36 = appInfo.QIMEI36;
            // const loginStatus = await isLogin();
            // this.hasLogin = loginStatus.hasLogin;
            
            // 临时模拟数据
            this.qimei36 = 'mock_qimei36_' + Date.now();
            this.hasLogin = Math.random() > 0.5;
          } catch (error) {
            console.error('[userStore] 获取腾讯新闻APP信息失败:', error);
          }
        }
      }
    },
    
    loadPlayCountFromLocalStorage() {
      const storedPlayDate = localStorage.getItem('swimming_lastPlayDate');
      const storedPlayCount = localStorage.getItem('swimming_todayPlayCount');
      
      if (storedPlayDate && storedPlayCount) {
        this.lastPlayDate = storedPlayDate;
        this.todayPlayCount = parseInt(storedPlayCount, 10);
      }
      
      this.savePlayCountToLocalStorage();
    },
    
    savePlayCountToLocalStorage() {
      localStorage.setItem('swimming_lastPlayDate', this.lastPlayDate);
      localStorage.setItem('swimming_todayPlayCount', this.todayPlayCount.toString());
    },
    
    incrementPlayCount() {
      const today = new Date().toDateString();
      
      if (this.lastPlayDate !== today) {
        this.lastPlayDate = today;
        this.todayPlayCount = 1;
      } else {
        this.todayPlayCount++;
      }
      
      this.savePlayCountToLocalStorage();
    }
  }
});