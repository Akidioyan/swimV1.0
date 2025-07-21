import { defineStore } from "pinia";
import { isQQNews } from "../utils/ua";
import { getOrCreateDeviceId } from "../utils/device";
// import { getAppInfo, isLogin, setActionBtnStyle } from "@tencent/qqnews-jsapi";

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
    lastBonusGrantDate: null
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
      
      // 尝试动态加载腾讯API（如果可用）
      if (this.isInQQNewsApp) {
        try {
          // 使用字符串拼接来避免Vite预处理
          const moduleName = '@tencent' + '/qqnews-jsapi';
          const qqnewsApi = await import(/* @vite-ignore */ moduleName);
          const { getAppInfo, isLogin } = qqnewsApi.default || qqnewsApi;
          
          const appInfo = await getAppInfo();
          this.qimei36 = appInfo?.qimei36 || '';
          this.hasLogin = await isLogin();
          
          console.log('[userStore] 腾讯API加载成功');
        } catch (error) {
          console.warn('[userStore] 腾讯API加载失败，使用fallback:', error.message);
          // Fallback逻辑
          this.qimei36 = 'mock_qimei36_' + Date.now();
          this.hasLogin = Math.random() > 0.5; // 模拟登录状态
        }
      } else {
        console.log('[userStore] 非腾讯新闻环境，使用默认值');
        this.qimei36 = '';
        this.hasLogin = false;
      }
      
      // 加载游戏次数数据
      this.loadPlayCountFromLocalStorage();
      
      console.log('[userStore] 环境初始化完成:', {
        isInQQNewsApp: this.isInQQNewsApp,
        hasLogin: this.hasLogin,
        deviceId: this.deviceId,
        canPlay: this.canPlay
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
    
    grantBonusPlays() {
      const today = new Date().toDateString();
      if (this.lastBonusGrantDate !== today) {
        this.bonusPlaysGrantedToday = true;
        this.lastBonusGrantDate = today;
        this.savePlayDataToLocalStorage();
        return true;
      }
      return false;
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
    }
  }
});
