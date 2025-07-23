import { defineStore } from 'pinia'
import { useUserStore } from './userStore' // 新增

export const useGameStore = defineStore('game', {
  state: () => ({
    // 服务器数据相关
    activityData: {
      totalParticipants: 81151, // 更真实的精确参与人数（基于设计稿中的数字）
      isLoading: false,
      lastUpdated: null
    },
    
    // 游泳游戏状态
    swimming: {
      distance: 0,           // 游泳距离（米）
      score: 0,              // 得分（星星数）
      stars: 0,              // 星星数（与score相同）
      gameTime: 0,           // 游戏时长（秒）
      survivalTime: 0,       // 生存时间（秒）
      gameEndReason: '',     // 游戏结束原因
      isGameActive: false,   // 游戏是否活跃
      gameStartTime: null,   // 游戏开始时间
      gameEndTime: null      // 游戏结束时间
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
    // 格式化参与人数显示 - 显示精确数字
    formattedParticipants: (state) => {
      const total = state.activityData.totalParticipants;
      // 使用toLocaleString()来添加千分位分隔符，显示精确数字
      return total.toLocaleString('zh-CN');
    },
    
    // 参与人数文本
    participantText: (state) => {
      const formatted = state.formattedParticipants;
      return `—— 已有${formatted}人参与过挑战 ——`;
    },
    
    // 游泳游戏相关getters
    distance: (state) => state.swimming.distance,
    score: (state) => state.swimming.score,
    stars: (state) => state.swimming.stars,
    gameTime: (state) => state.swimming.gameTime,
    survivalTime: (state) => state.swimming.survivalTime,
    gameEndReason: (state) => state.swimming.gameEndReason,
    isGameActive: (state) => state.swimming.isGameActive,
    
    // 游戏时长计算
    gameDuration: (state) => {
      if (state.swimming.gameStartTime && state.swimming.gameEndTime) {
        return state.swimming.gameEndTime - state.swimming.gameStartTime;
      }
      return 0;
    },
    
    // 平均速度计算
    averageSpeed: (state) => {
      const duration = state.gameDuration / 1000; // 转换为秒
      if (duration > 0) {
        return (state.swimming.distance / duration).toFixed(2);
      }
      return 0;
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
    // 修改第68行和第109行的动态导入路径
    async fetchActivityPV() {
      if (this.activityData.isLoading) return;
      
      this.activityData.isLoading = true;
      
      try {
        console.log('正在获取活动参与人数...');
        // 修改：从 '../dataStore/request' 改为 '../utils/request'
        const { getActivityPV } = await import('../utils/request');
        const response = await getActivityPV();
        
        // 支持多种API响应格式
        if (response && typeof response === 'object') {
          // 优先使用新格式的 current_pv 字段，其次是 total 字段，最后是 pv 字段
          const participantCount = response.current_pv || response.total || response.pv;
          if (participantCount && typeof participantCount === 'number') {
            this.activityData.totalParticipants = participantCount;
            this.activityData.lastUpdated = new Date();
            console.log('活动参与人数更新成功:', participantCount, '显示为:', this.formattedParticipants);
            
            // 如果有next_no字段，可以保存下次编号（可选）
            if (response.next_no) {
              console.log('下一个用户编号:', response.next_no);
            }
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
    
    // 游泳游戏相关actions
    startSwimmingGame() {
      this.swimming.isGameActive = true;
      this.swimming.gameStartTime = Date.now();
      this.swimming.distance = 0;
      this.swimming.score = 0;
      this.swimming.stars = 0;
      this.swimming.gameTime = 0;
      this.swimming.survivalTime = 0;
      this.swimming.gameEndReason = '';
      console.log('🏊‍♂️ 游泳游戏开始');
    },
    
    endSwimmingGame(reason = 'completed') {
      this.swimming.isGameActive = false;
      this.swimming.gameEndTime = Date.now();
      this.swimming.gameEndReason = reason;
      this.swimming.gameTime = this.gameDuration / 1000; // 转换为秒
      console.log(`🏁 游泳游戏结束: ${reason}`);
      console.log(`📊 最终成绩 - 距离: ${this.swimming.distance}米, 得分: ${this.swimming.score}分`);
    },
    
    updateSwimmingDistance(distance) {
      if (this.swimming.isGameActive) {
        this.swimming.distance = Math.max(0, distance);
      }
    },
    
    updateSwimmingScore(score) {
      if (this.swimming.isGameActive) {
        this.swimming.score = Math.max(0, score);
        this.swimming.stars = this.swimming.score; // 保持同步
      }
    },
    
    addSwimmingScore(points = 1) {
      if (this.swimming.isGameActive) {
        this.swimming.score += points;
        this.swimming.stars = this.swimming.score; // 保持同步
      }
    },
    
    addSwimmingDistance(meters) {
      if (this.swimming.isGameActive) {
        this.swimming.distance += meters;
      }
    },
    
    updateSurvivalTime(time) {
      if (this.swimming.isGameActive) {
        this.swimming.survivalTime = time;
      }
    },
    
    resetSwimmingGame() {
      this.swimming.distance = 0;
      this.swimming.score = 0;
      this.swimming.stars = 0;
      this.swimming.gameTime = 0;
      this.swimming.survivalTime = 0;
      this.swimming.gameEndReason = '';
      this.swimming.isGameActive = false;
      this.swimming.gameStartTime = null;
      this.swimming.gameEndTime = null;
      console.log('🔄 游泳游戏状态已重置');
    },
    
    // 重启游戏
    restartGame() {
      this.resetSwimmingGame();
      this.startSwimmingGame();
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
        
        // 同步游戏数据到gameStore的swimming状态
        this.swimming.distance = gameData.distance || 0;
        this.swimming.score = gameData.score || 0;
        this.swimming.stars = gameData.stars || gameData.score || 0;
        this.swimming.gameTime = gameData.gameTime || 0;
        this.swimming.survivalTime = gameData.survivalTime || 0;
        this.swimming.gameEndReason = gameData.gameEndReason || 'completed';
        
        console.log('正在上报游戏结果...', gameData);
        
        // 动态导入API方法
        // 修改：从 '../dataStore/request' 改为 '../utils/request'
        const { reportSwimmingGameResult } = await import('../utils/request');
        
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
