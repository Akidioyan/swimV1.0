import { defineStore } from 'pinia'
import { useUserStore } from './userStore' // 新增

export const useGameStore = defineStore('game', {
  state: () => ({
    // 服务器数据相关
    activityData: {
      totalParticipants: 91000, // 默认参与人数
      isLoading: false,
      lastUpdated: null
    },
    
    // 排行榜数据
    leaderboard: {
      currentUserEntry: null,
      leaderboardEntries: [],
      rankPercent: '',
      best: null,
      trophiesHistory: [0,0,0,0,0,0]
    }
  }),
  
  getters: {
    // 格式化参与人数显示
    formattedParticipants: (state) => {
      const total = state.activityData.totalParticipants;
      if (total >= 10000) {
        const result = total / 10000;
        if (result >= 10) {
          return `${Math.floor(result)}万`;
        } else {
          return `${Math.floor(result * 10) / 10}万`;
        }
      } else {
        return total.toLocaleString();
      }
    },
    
    // 参与人数文本
    participantText: (state) => {
      const formatted = state.formattedParticipants;
      return `—— 已有${formatted}人参与过挑战 ——`;
    },
    
    // 新增：获取用户环境信息
    userEnvironment: (state) => {

      const userStore = useUserStore()
      return {
        isInQQNewsApp: userStore.isInQQNewsApp,
        hasLogin: userStore.hasLogin,
        canPlay: userStore.canPlay,
        remainingPlays: userStore.remainingPlays
      }
    }
  },
  
  actions: {
    // 获取活动参与人数
    async fetchActivityPV() {
      if (this.activityData.isLoading) return;
      
      this.activityData.isLoading = true;
      
      try {
        console.log('正在获取活动参与人数...');
        // 动态导入API方法
        const { getActivityPV } = await import('../dataStore/request');
        const response = await getActivityPV();
        
        // 支持多种API响应格式
        if (response && typeof response === 'object') {
          // 优先使用 total 字段，如果没有则使用 pv 字段
          const participantCount = response.total || response.pv;
          if (participantCount && typeof participantCount === 'number') {
            this.activityData.totalParticipants = participantCount;
            this.activityData.lastUpdated = new Date();
            console.log('活动参与人数更新成功:', participantCount, '显示为:', this.formattedParticipants);
          } else {
            console.warn('API返回数据中未找到有效的参与人数字段:', response);
          }
        }
      } catch (error) {
        console.error('获取活动参与人数失败:', error);
        // 保持默认值
      } finally {
        this.activityData.isLoading = false;
      }
    },
    
    // 上报游戏结果
    // 修改：上报游戏结果时包含用户环境信息和次数管理
    async reportGameSummary(gameData) {
      try {
        const userStore = useUserStore()
        
        // 检查用户是否可以游戏
        if (!userStore.canPlay) {
          console.warn('用户今日游戏次数已用完');
          return null;
        }
        
        // 增加游戏次数
        userStore.incrementTodayPlayCount();
        
        console.log('正在上报游戏结果...', gameData);
        
        // 动态导入API方法
        const { reportSwimmingGameResult } = await import('../dataStore/request');
        
        const enhancedGameData = {
          ...gameData,
          deviceId: userStore.deviceId,
          qimei36: userStore.qimei36,
          hasLogin: userStore.hasLogin,
          isInQQNewsApp: userStore.isInQQNewsApp,
          userAgent: userStore.userAgent
        };
        
        const response = await reportSwimmingGameResult(enhancedGameData);
        
        if (response && response.data) {
          // 更新排行榜数据
          this.leaderboard = {
            currentUserEntry: response.data.currentUserEntry,
            leaderboardEntries: response.data.leaderboardEntries || [],
            rankPercent: response.data.rankPercent || '',
            best: response.data.best,
            trophiesHistory: response.data.trophiesHistory || []
          };
          
          console.log('游戏结果上报成功，排行榜已更新');
        }
        
        return response;
      } catch (error) {
        console.error('上报游戏结果失败:', error);
        return null;
      }
    }
  }
})
