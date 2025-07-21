// src/dataStore/request.js
// API请求管理模块，处理与服务器的数据交互

// 基础请求函数
export async function request(path, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  try {
    console.log(`🌐 发起API请求: ${path}`, defaultOptions);
    
    // 直接使用传入的路径，不添加前缀（因为路径已经包含了正确的前缀）
    const response = await fetch(path, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ API请求成功: ${path}`, data);
    return data;
    
  } catch (error) {
    console.error(`❌ API请求失败: ${path}`, error);
    
    // 返回模拟数据作为降级方案
    if (path.includes('/pingpang/pv') || path.includes('/pv')) {
      return { total: 91000 + Math.floor(Math.random() * 1000) };
    }
    
    if (path.includes('report') || path.includes('summary')) {
      return {
        currentUserEntry: null,
        leaderboardEntries: [],
        rankPercent: '99%',
        best: null,
        trophiesHistory: [0,0,0,0,0,0]
      };
    }
    
    throw error;
  }
}

// 获取活动总人数
// 获取活动总人数
export async function getActivityPV() {
  try {
    const endpoints = [
      '/api/activity/pingpong/pv',         // 修改：改为pingpong接口
      '/apiactivity/pingpong/pv',          // 修改：改为pingpong接口
      '/api/activity/pv',                  
      '/apiactivity/pv',                   
    ];
    
    let response;
    let lastError;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🌐 尝试活动API端点: ${endpoint}`);
        response = await request(endpoint, {
          method: 'GET'
        });
        console.log(`✅ 活动API端点 ${endpoint} 请求成功:`, response);
        break;
      } catch (error) {
        console.log(`⚠️ 活动API端点 ${endpoint} 失败:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    if (!response) {
      console.log('📊 所有活动API端点都失败，使用模拟数据');
      throw lastError;
    }
    
    return response;
  } catch (error) {
    console.error('获取活动人数失败，使用默认值:', error);
    const baseCount = 91000;
    const randomGrowth = Math.floor(Math.random() * 2000) + 100;
    return { total: baseCount + randomGrowth };
  }
}

// 游戏结束数据上报并获取排行榜
export async function reportSwimmingGameResult(gameData) {
  try {
    const endpoints = [
      '/api/activity/pingpong_report',     // 修改：改为pingpong接口
      '/apiactivity/pingpong_report',      // 修改：改为pingpong接口
      '/api/activity/report_summary',      // 修改：改为pingpong接口
      '/apiactivity/report_summary'        // 修改：改为pingpong接口
    ];
    
    const requestBody = {
      deviceId: gameData.deviceId || '',
      qimei36: gameData.qimei36 || '',
      hasLogin: gameData.hasLogin || false,
      isInQQNewsApp: gameData.isInQQNewsApp || false,
      userAgent: gameData.userAgent || '',
      event: 'pingpong_game_ended',        // 修改：改为pingpong事件
      levelsCompleted: gameData.distance || 0,  // 距离映射为关卡数
      cupsDropped: gameData.score || 0,         // 得分映射为击倒杯子数
      ballsUsed: gameData.ballsUsed || 15,      // 添加球数
      score: gameData.totalScore || gameData.score || 0,
      gameEndReason: gameData.gameEndReason || 'completed',
      trophiesEarned: gameData.trophiesEarned || []
    };
    
    let response;
    let lastError;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🌐 尝试游戏结果上报端点: ${endpoint}`);
        response = await request(endpoint, {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });
        console.log(`✅ 游戏结果上报成功:`, response);
        break;
      } catch (error) {
        console.log(`⚠️ 端点 ${endpoint} 失败:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    if (!response) {
      console.log('📊 所有上报端点都失败，使用模拟排行榜数据');
      throw lastError;
    }
    
    return response;
  } catch (error) {
    console.error('游戏结果上报失败，使用模拟数据:', error);
    return generateMockPingpongLeaderboard(gameData);
  }
}

// 生成模拟乒乓球排行榜数据
function generateMockPingpongLeaderboard(gameData) {
  const mockLeaderboard = [];
  const nicknames = ['快乐小兔侠客', '开心狮子玩家', '快乐小猪侠客', '勇敢小熊战士', '聪明小猫大师'];
  
  // 生成前50名数据，按得分优先，距离次要排序
  for (let i = 1; i <= 50; i++) {
    const score = Math.max(1, 100 - i * 2 + Math.floor(Math.random() * 10));
    const distance = Math.max(50, 500 - i * 8 + Math.floor(Math.random() * 50));
    
    mockLeaderboard.push({
      rank: i,
      nick: `${nicknames[Math.floor(Math.random() * nicknames.length)]}_${Math.floor(Math.random() * 1000)}`,
      distance: distance,
      score: score
    });
  }
  
  // 按游泳游戏规则排序：得分优先，得分相同时距离远的排前面
  mockLeaderboard.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score; // 得分高的排前面
    }
    return b.distance - a.distance; // 得分相同时，距离远的排前面
  });
  
  // 重新分配排名
  mockLeaderboard.forEach((item, index) => {
    item.rank = index + 1;
  });
  
  const currentUserRank = Math.floor(Math.random() * 1000) + 51;
  const rankPercent = Math.floor((1 - currentUserRank / 10000) * 100);
  
  return {
    data: {
      rankPercent: `${rankPercent}%`,
      best: {
        rank: Math.min(currentUserRank - 10, 1),
        distance: gameData.distance + 50,
        score: gameData.score + 5
      },
      currentUserEntry: {
        rank: currentUserRank,
        nick: '我',
        distance: gameData.distance || 0,
        score: gameData.score || 0
      },
      leaderboardEntries: mockLeaderboard
    }
  };
}

// 游戏结束上报
export async function reportGameSummary(gameData) {
  try {
    // 尝试活动相关的上报端点
    const endpoints = [
      '/apiactivity/pingpong_report',      // 乒乓球游戏上报端点
      '/apiactivity/report_summary',       // 活动总结上报端点  
      '/api/activity/pingpong_report',     // 通用API的乒乓球上报
      '/api/activity/report_summary',      // 通用API的总结上报
    ];
    
    let response;
    let lastError;
    
    // 依次尝试各个上报端点
    for (const endpoint of endpoints) {
      try {
        console.log(`🌐 尝试游戏上报端点: ${endpoint}`);
        response = await request(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            score: gameData.score || 0,
            distance: gameData.distance || 0,
            stars: gameData.stars || 0,
            survivalTime: gameData.survivalTime || 0,
            gameTime: gameData.gameTime || 0,
            deviceId: gameData.deviceId || 'unknown',
            bestScore: gameData.bestScore || 0,
            bestDistance: gameData.bestDistance || 0,
            timestamp: gameData.timestamp || Date.now()
          })
        });
        console.log(`✅ 游戏上报端点 ${endpoint} 成功:`, response);
        break;
      } catch (error) {
        console.log(`⚠️ 游戏上报端点 ${endpoint} 失败:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    // 如果所有端点都失败，返回模拟响应
    if (!response) {
      console.log('📊 所有游戏上报端点都失败，返回模拟排行榜数据');
      throw lastError;
    }
    
    return response;
  } catch (error) {
    console.error('游戏结果上报失败:', error);
    // 返回模拟的排行榜数据
    return {
      currentUserEntry: {
        rank: Math.floor(Math.random() * 10000) + 1,
        score: gameData.score || 0,
        stars: gameData.stars || 0
      },
      leaderboardEntries: [],
      rankPercent: `${Math.floor(Math.random() * 100)}%`,
      best: gameData.score || 0,
      trophiesHistory: [gameData.stars || 0, 0, 0, 0, 0, 0]
    };
  }
}

// 环境上报
export async function reportEnvironment(environmentData) {
  try {
    const response = await request('/activity/pingpong_report', {
      method: 'POST',
      body: JSON.stringify(environmentData)
    });
    return response;
  } catch (error) {
    console.error('环境上报失败，使用降级处理:', error);
    // 不重新抛出错误，让降级逻辑生效
    return {
      success: false,
      message: '环境上报失败，使用本地模式',
      fallback: true
    };
  }
}