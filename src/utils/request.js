// src/utils/request.js
// API请求管理模块，处理与服务器的数据交互
import { useGameStore } from '../stores/gameStore';
import { useUserStore } from '../stores/userStore';

// 活动ID常量
const activity_id = 'swim_game';

// 基础请求函数
export async function request(path, options = {}) {
  const u = useUserStore();

  const headers = {
    'Content-Type': 'application/json',
    'X-Device-Id': u.deviceId || '', 
    ...(u.qimei36 && { 'X-QIMEI36': u.qimei36 }),
    'X-Has-Login': String(u.hasLogin),
    ...options.headers 
  };

  const fetchOptions = {
    credentials: 'include',
    ...options, 
    headers,    
  };

  console.log('VITE_API_BASE_URL in request.js:', import.meta.env.VITE_API_BASE_URL);
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';
  const apiUrl = VITE_API_BASE_URL + path;

  try {
    console.log(`🌐 发起API请求: ${apiUrl}`, fetchOptions);
    const response = await fetch(apiUrl, fetchOptions);

    if (!response.ok) {
      let errorData = { message: `HTTP error! Status: ${response.status} for ${apiUrl}` };
      try {
        const body = await response.clone().json(); 
        errorData = { ...errorData, ...body };
      } catch (e) {
        // If body is not JSON or error during parsing, use response.statusText
        if (response.statusText) {
            errorData.message = `HTTP error! Status: ${response.status} ${response.statusText} for ${apiUrl}`;
        }
      }
      console.error('❌ API请求失败详情:', errorData);
      throw new Error(errorData.message);
    }

    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return undefined; 
    }

    const data = await response.json();
    console.log(`✅ API请求成功: ${apiUrl}`, data);
  
    
    return data;
  } catch (error) {
    console.error(`❌ API请求网络错误 ${apiUrl}:`, error);
    throw error; 
  }
}


// 兼容性函数：获取活动总人数（适配游泳游戏）
export async function getActivityPV() {
  try {
    console.log('开始调用活动PV API...');
    const response = await request('/activity/pv', {
      method: 'POST',
      body: JSON.stringify({
        activity_id: activity_id
      })
    });
    console.log('活动PV API 调用成功:', response);
    return response;
  } catch (error) {
    console.error('活动PV API 调用失败:', error);
    // 不再返回模拟数据，抛出错误
    throw error;
  }
}

// 游戏结果上报（适配游泳游戏）
export async function reportSwimmingGameResult(gameData) {
  console.log('游泳游戏结果上报，使用排行榜API...', gameData);
  
  // 使用排行榜API来提交游戏结果并获取排行榜
  return await submitGameResultAndGetRanking(gameData);
}

// 环境上报
export async function reportEnvironment(environmentData) {
  try {
    console.log('环境上报数据:', environmentData);
    // 暂时使用模拟响应，避免调用不存在的接口
    return {
      success: true,
      message: '环境上报成功（模拟）',
      fallback: false
    };
  } catch (error) {
    console.error('环境上报失败，使用降级处理:', error);
    return {
      success: false,
      message: '环境上报失败，使用本地模式',
      fallback: true
    };
  }
}

// 解析score，将其拆分为星星数和距离
// score格式：星星数*100000 + 距离*1
export function parseScoreToStarsAndDistance(score) {
  const stars = Math.floor(score / 100000); // 得到星星数
  const distance = score % 100000; // 得到距离
  return {
    stars: stars,
    distance: distance
  };
}

// 格式化排行榜数据，添加解析后的星星数和距离
export function formatRankingData(apiResponse) {
  if (!apiResponse || !apiResponse.data || !apiResponse.data.ranking_board) {
    return apiResponse;
  }
  
  // 为每个排行榜条目添加解析后的星星数和距离
  const formattedRankingBoard = apiResponse.data.ranking_board.map(item => {
    const parsed = parseScoreToStarsAndDistance(item.ranking.score);
    return {
      ...item,
      ranking: {
        ...item.ranking,
        stars: parsed.stars,
        distance: parsed.distance
      }
    };
  });
  
  // 同样处理best_rank
  let formattedBestRank = null;
  if (apiResponse.data.best_rank) {
    const parsedBest = parseScoreToStarsAndDistance(apiResponse.data.best_rank.score);
    formattedBestRank = {
      ...apiResponse.data.best_rank,
      stars: parsedBest.stars,
      distance: parsedBest.distance
    };
  }
  
  return {
    ...apiResponse,
    data: {
      ...apiResponse.data,
      ranking_board: formattedRankingBoard,
      best_rank: formattedBestRank
    }
  };
}

// Allow both named and default import
export default request;

// 获取排行榜前50名（端外用户专用）
export async function getRankingBoard() {
  try {
    console.log('获取排行榜前50名数据...');
    
    const requestBody = {
      activity_id: activity_id,
      ranking_size: 50
    };
    
    console.log('排行榜查询请求:', requestBody);
    
    const response = await request('/activity/ranking_board', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    
    console.log('排行榜前50名查询成功:', response);
    
    // 格式化排行榜数据，添加解析后的星星数和距离
    const formattedResponse = formatRankingData(response);
    console.log('格式化后的排行榜数据:', formattedResponse);
    
    return formattedResponse;
    
  } catch (error) {
    console.error('排行榜前50名查询失败:', error);
    // 不再返回模拟数据，抛出错误
    throw error;
  }
}

// 提交游戏结果并获取排行榜
export async function submitGameResultAndGetRanking(gameData) {
  try {
    console.log('提交游戏结果并获取排行榜...', gameData);
    
    // 计算最终得分：得分*100000 + 距离*1
    const finalScore = (gameData.score || 0) * 100000 + (gameData.distance || 0);
    
    const requestBody = {
      activity_id: activity_id,
      ranking_size: 50,
      score: finalScore
      // user_id 不需要传，确保登录即可
    };
    
    console.log('排行榜提交数据:', requestBody);
    console.log(`得分计算: ${gameData.score || 0} * 100000 + ${gameData.distance || 0} = ${finalScore}`);
    
    // 修改API路径，将activity_id放在请求体中
    const response = await request('/activity/ranking', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    
    console.log('排行榜API调用成功:', response);
    
    // 格式化排行榜数据，添加解析后的星星数和距离
    const formattedResponse = formatRankingData(response);
    console.log('格式化后的排行榜数据:', formattedResponse);
    
    return formattedResponse;
    
  } catch (error) {
    console.error('排行榜API调用失败:', error);
    // 不再返回模拟数据，抛出错误
    throw error;
  }
}

// 仅获取排行榜（不提交成绩）
export async function getRankingOnly() {
  try {
    console.log('获取排行榜数据...');
    
    const requestBody = {
      activity_id: activity_id,
      ranking_size: 50
      // user_id 不需要传，确保登录即可
    };
    
    console.log('排行榜查询请求:', requestBody);
    
    // 修改API路径，将activity_id放在请求体中
    const response = await request('/activity/ranking', {   
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    
    console.log('排行榜查询成功:', response);
    
    // 格式化排行榜数据，添加解析后的星星数和距离
    const formattedResponse = formatRankingData(response);
    console.log('格式化后的排行榜数据:', formattedResponse);
    
    return formattedResponse;
    
  } catch (error) {
    console.error('排行榜查询失败:', error);
    // 不再返回模拟数据，抛出错误
    throw error;
  }
}

// 测试排行榜API功能
export async function testLeaderboardAPI() {
  console.log('🧪 开始测试排行榜API...')
  try {
    const response = await getRankingOnly()
    console.log('✅ 排行榜API测试成功:', response)
    return response
  } catch (error) {
    console.error('❌ 排行榜API测试失败:', error)
    return null
  }
}

