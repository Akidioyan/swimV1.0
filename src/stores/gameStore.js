import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    // 服务器数据相关
    activityData: {
      totalParticipants: 481151, // 默认参与人数
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
      if (total >= 100000) {
        return `${Math.floor(total / 1000) / 10}万`;
      } else if (total >= 10000) {
        return `${Math.floor(total / 1000)}万`;
      } else {
        return total.toLocaleString();
      }
    },
    
    // 参与人数文本
    participantText: (state) => {
      const formatted = state.formattedParticipants;
      return `—— 已有${formatted}人参与过挑战 ——`;
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
        
        if (response && response.total) {
          this.activityData.totalParticipants = response.total;
          this.activityData.lastUpdated = new Date();
          console.log('活动参与人数更新成功:', response.total);
        }
      } catch (error) {
        console.error('获取活动参与人数失败:', error);
        // 保持默认值
      } finally {
        this.activityData.isLoading = false;
      }
    },
    
    // 上报游戏结果
    async reportGameSummary(gameData) {
      try {
        // 动态导入API方法
        const { reportGameSummary } = await import('../dataStore/request');
        const response = await reportGameSummary(gameData);
        
        if (response) {
          // 更新排行榜数据
          this.leaderboard.currentUserEntry = response.currentUserEntry;
          this.leaderboard.leaderboardEntries = response.leaderboardEntries || [];
          this.leaderboard.rankPercent = response.rankPercent || '';
          this.leaderboard.best = response.best;
          this.leaderboard.trophiesHistory = response.trophiesHistory || [0,0,0,0,0,0];
          
          console.log('游戏结果上报成功，排行榜数据已更新');
        }
        
        return response;
      } catch (error) {
        console.error('游戏结果上报失败:', error);
        return null;
      }
    }
  }
})
