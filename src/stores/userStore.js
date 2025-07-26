import { defineStore } from "pinia";
import { isQQNews } from "../utils/ua";
import { getOrCreateDeviceId } from "../utils/device";
import { getAppInfo, isLogin, setActionBtnStyle } from "@tencent/qqnews-jsapi";

console.log("[userStore.js] Module loading...");

export const useUserStore = defineStore("user", {
  state: () => ({
    isInQQNewsApp: false,
    userAgent: '',
    deviceId: '',
    qimei36: '',
    hasLogin: false,
    todayPlayCount: 0,
    lastPlayDate: null,
    bonusPlaysGrantedToday: false,
    lastBonusGrantDate: null,
    isInitialized: false // 添加初始化状态标记
  }),
  
  getters: {
    maxPlaysAllowed: (state) => {
      return state.bonusPlaysGrantedToday ? 8 : 5;
    },
    remainingPlays: (state) => {
      return Math.max(0, state.maxPlaysAllowed - state.todayPlayCount);
    },
    canPlay: (state) => {
      return state.remainingPlays > 0;
    }
  },
  
  actions: {
    async initEnvironment() {
      console.log('[userStore] 初始化环境...');
      this.userAgent = navigator.userAgent;
      this.deviceId = getOrCreateDeviceId();
      this.isInQQNewsApp = isQQNews();
      
      console.log('[userStore] 环境检测结果:', {
        isInQQNewsApp: this.isInQQNewsApp,
        userAgent: this.userAgent.substring(0, 100) + '...'
      });
      
      // 在腾讯新闻APP内时获取登录状态
      if (this.isInQQNewsApp) {
        try {
          const appInfo = await getAppInfo();
          this.qimei36 = appInfo?.qimei36 || '';
          console.log('[userStore] APP信息获取成功:', { qimei36: this.qimei36 });
          
          console.log('[userStore] 🔍 开始检测登录状态...');
          const loginResult = await isLogin();
          console.log('[userStore] 🔍 isLogin API原始返回值:', loginResult);
          
          // 处理不同格式的返回值
          let loginStatus = false;
          if (typeof loginResult === 'boolean') {
            loginStatus = loginResult;
          } else if (typeof loginResult === 'object' && loginResult !== null) {
            // 处理对象格式的返回值
            loginStatus = loginResult.hasLogin || loginResult.isLogin || loginResult.status || false;
          } else {
            loginStatus = Boolean(loginResult);
          }
          
          this.hasLogin = loginStatus;
          console.log('[userStore] 登录状态检测完成:', { 
            rawResult: loginResult,
            parsedLogin: loginStatus,
            hasLogin: this.hasLogin 
          });
          
          if (this.hasLogin) {
            console.log('[userStore] ✅ 用户已登录，无需显示登录提示');
          } else {
            console.log('[userStore] ❌ 用户未登录，将显示登录提示');
          }
        } catch (error) {
          console.warn('[userStore] 腾讯JSAPI调用失败，使用fallback:', error.message);
          console.warn('[userStore] 错误详情:', error);
          this.qimei36 = '';
          this.hasLogin = false;
          console.log('[userStore] 使用fallback状态: hasLogin = false');
        }
      } else {
        console.log('[userStore] 非腾讯新闻APP环境，使用默认值');
        this.qimei36 = '';
        this.hasLogin = false;
      }
      
      // 加载游戏次数数据
      this.loadPlayCountFromLocalStorage();
      
      // 标记初始化完成
      this.isInitialized = true;
      
      console.log('[userStore] 🎯 环境初始化完成:', {
        isInQQNewsApp: this.isInQQNewsApp,
        hasLogin: this.hasLogin,
        deviceId: this.deviceId,
        canPlay: this.canPlay,
        shouldShowLoginPrompt: this.isInQQNewsApp && !this.hasLogin,
        isInitialized: this.isInitialized
      });
    },
    
    // 分享功能的安全封装
    async shareGameResult(gameData) {
      if (!this.isInQQNewsApp) {
        console.log('[userStore] 非APP环境，跳过分享功能');
        return false;
      }
      
      try {
        const qqnewsApi = await import('@tencent/qqnews-jsapi');
        const { setShareInfo, showShareMenu } = qqnewsApi;
        
        await setShareInfo({
          title: '游泳小游戏',
          longTitle: `恭喜你！游泳距离${gameData.distance}米，获得${gameData.score}颗星星，全国排名第${gameData.rank}位！`,
          content: '快来挑战游泳小游戏吧！',
          url: window.location.href,
          imgUrl: gameData.shareImage || 'https://via.placeholder.com/150'
        });
        
        await showShareMenu();
        return true;
      } catch (error) {
        console.error('[userStore] 分享功能调用失败:', error);
        return false;
      }
    },
    
    loadPlayCountFromLocalStorage() {
      const today = new Date().toDateString();
      const savedData = localStorage.getItem('swimGamePlayData');
      
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          if (data.lastPlayDate === today) {
            this.todayPlayCount = data.todayPlayCount || 0;
            this.bonusPlaysGrantedToday = data.bonusPlaysGrantedToday || false;
          } else {
            this.todayPlayCount = 0;
            this.bonusPlaysGrantedToday = false;
          }
          this.lastPlayDate = today;
          this.lastBonusGrantDate = data.lastBonusGrantDate;
        } catch (error) {
          console.error('解析游戏数据失败:', error);
          this.resetPlayData();
        }
      } else {
        this.resetPlayData();
      }
    },
    
    incrementTodayPlayCount() {
      this.todayPlayCount++;
      this.lastPlayDate = new Date().toDateString();
      this.savePlayDataToLocalStorage();
    },
    
    resetPlayData() {
      this.todayPlayCount = 0;
      this.lastPlayDate = new Date().toDateString();
      this.bonusPlaysGrantedToday = false;
      this.lastBonusGrantDate = null;
    },
    
    savePlayDataToLocalStorage() {
      const data = {
        todayPlayCount: this.todayPlayCount,
        lastPlayDate: this.lastPlayDate,
        bonusPlaysGrantedToday: this.bonusPlaysGrantedToday,
        lastBonusGrantDate: this.lastBonusGrantDate
      };
      localStorage.setItem('swimGamePlayData', JSON.stringify(data));
    },
    
    // 记录当前游戏次数状态
    logCurrentPlayStats(context = '') {
      console.log(`[${context}] 当前游戏状态:`, {
        todayPlayCount: this.todayPlayCount,
        maxPlaysAllowed: this.maxPlaysAllowed,
        remainingPlays: this.remainingPlays,
        canPlay: this.canPlay,
        bonusPlaysGrantedToday: this.bonusPlaysGrantedToday
      });
    },
    
    // 授予奖励次数
    grantBonusPlays(amount = 3) {
      const today = new Date().toDateString();
      console.log(`[userStore] grantBonusPlays called - today: ${today}, lastBonusGrantDate: ${this.lastBonusGrantDate}`);
      
      if (this.lastBonusGrantDate !== today) {
        const previousCanPlay = this.canPlay;
        const previousRemainingPlays = this.remainingPlays;
        
        this.bonusPlaysGrantedToday = true;
        this.lastBonusGrantDate = today;
        this.savePlayDataToLocalStorage();
        
        console.log(`[userStore] 授予奖励游戏次数: ${amount}次`);
        console.log(`[userStore] 状态变化: canPlay ${previousCanPlay} -> ${this.canPlay}, remainingPlays ${previousRemainingPlays} -> ${this.remainingPlays}`);
        console.log(`[userStore] 当前状态: todayPlayCount=${this.todayPlayCount}, maxPlaysAllowed=${this.maxPlaysAllowed}, bonusPlaysGrantedToday=${this.bonusPlaysGrantedToday}`);
        
        return true;
      } else {
        console.log(`[userStore] 今日已授予奖励次数`);
        return false;
      }
    },

    // 手动刷新登录状态（用于登录完成后更新状态）
    async refreshLoginStatus() {
      if (!this.isInQQNewsApp) {
        console.log('[userStore] 非APP环境，跳过登录状态刷新');
        return false;
      }

      console.log('[userStore] 🔄 手动刷新登录状态...');
      
      try {
        const previousLoginStatus = this.hasLogin;
        const loginStatus = await isLogin();
        this.hasLogin = loginStatus;
        
        console.log('[userStore] 登录状态刷新完成:', {
          previousStatus: previousLoginStatus,
          currentStatus: this.hasLogin,
          statusChanged: previousLoginStatus !== this.hasLogin
        });
        
        if (previousLoginStatus !== this.hasLogin) {
          console.log('[userStore] ✅ 登录状态已更新！');
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('[userStore] 刷新登录状态失败:', error);
        return false;
      }
    }
  }
});
