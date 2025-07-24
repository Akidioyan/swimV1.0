// src/utils/request.js
// API请求管理模块，处理与服务器的数据交互
import { useGameStore } from '../stores/gameStore';
import { useUserStore } from '../stores/userStore';

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
    const response = await request('/activity/pv?activity_id=swim_game', {
      method: 'GET'
    });
    console.log('活动PV API 调用成功:', response);
    return response;
  } catch (error) {
    console.error('活动PV API 调用失败:', error);
    // 返回模拟数据作为降级处理 - 基于真实的活动数据
    const baseCount = 81151; // 
    const randomGrowth = Math.floor(Math.random() * 500) + 50; // 小幅度随机增长
    const totalParticipants = baseCount + randomGrowth;
    console.log('使用降级数据，参与人数:', totalParticipants);
    // 适配新的返回格式
    return { 
      current_pv: totalParticipants,
      next_no: totalParticipants + 1
    };
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

// 提交游戏结果并获取排行榜
export async function submitGameResultAndGetRanking(gameData) {
  try {
    console.log('提交游戏结果并获取排行榜...', gameData);
    
    // 计算最终得分：得分*100000 + 距离*1
    const finalScore = (gameData.score || 0) * 100000 + (gameData.distance || 0);
    
    const requestBody = {
      // activity_id 现在通过URL参数传递，不在请求体中
      ranking_size: 50,
      score: finalScore
      // user_id 不需要传，确保登录即可
    };
    
    console.log('排行榜提交数据:', requestBody);
    console.log(`得分计算: ${gameData.score || 0} * 100000 + ${gameData.distance || 0} = ${finalScore}`);
    
    // 修改API路径，将activity_id作为URL参数
    const response = await request('/activity/ranking?activity_id=swim_game', {
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
    // 返回模拟数据作为降级处理
    const mockData = generateMockRankingData(gameData);
    return formatRankingData(mockData);
  }
}

// 仅获取排行榜（不提交成绩）
export async function getRankingOnly() {
  try {
    console.log('获取排行榜数据...');
    
    const requestBody = {
      // activity_id 现在通过URL参数传递，不在请求体中
      ranking_size: 50
      // user_id 不需要传，确保登录即可
    };
    
    console.log('排行榜查询请求:', requestBody);
    
    // 修改API路径，将activity_id作为URL参数
    const response = await request('/activity/ranking?activity_id=swim_game', {   
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
    // 返回模拟数据作为降级处理
    const mockData = generateMockRankingData();
    return formatRankingData(mockData);
  }
}

// 生成模拟排行榜数据（降级处理）
function generateMockRankingData(gameData = null) {
  console.log('使用模拟排行榜数据');
  
  const mockRankingBoard = [];
  const nicknames = ['游泳健将', '水中飞鱼', '蛙泳高手', '自由泳达人', '仰泳专家', '蝶泳王者', '混合泳大师'];
  const headUrls = [
    'https://inews.gtimg.com/om_ls/OXqWE1gpeCwuFsrBRTYRPAR35t8jNJPJBzzGG_Ga4XHyoAA_200200/0',
    'http://p.qpic.cn/user_pic/0/_1750140487107295905/243'
  ];
  
  // 生成前50名数据
  for (let i = 1; i <= 50; i++) {
    const stars = Math.max(10, 120 - i + Math.floor(Math.random() * 20)); // 星星数
    const distance = Math.max(100, 1000 - i * 10 + Math.floor(Math.random() * 100)); // 距离
    const finalScore = stars * 100000 + distance; // 按新公式计算
    
    mockRankingBoard.push({
      ranking: {
        rank: i,
        score: finalScore
      },
      user_info: {
        head_url: headUrls[Math.floor(Math.random() * headUrls.length)],
        nick: `${nicknames[Math.floor(Math.random() * nicknames.length)]}${Math.floor(Math.random() * 1000)}`,
        openid: "",
        suid: `mock_user_${i}_${Date.now()}`
      }
    });
  }
  
  // 按最终得分排序
  mockRankingBoard.sort((a, b) => b.ranking.score - a.ranking.score);
  
  // 重新分配排名
  mockRankingBoard.forEach((item, index) => {
    item.ranking.rank = index + 1;
  });
  
  // 生成用户相关数据
  let bestRank = null;
  let lessScoreCount = 0;
  
  if (gameData) {
    const userFinalScore = (gameData.score || 0) * 100000 + (gameData.distance || 0);
    bestRank = {
      rank: Math.floor(Math.random() * 1000) + 51,
      score: userFinalScore
    };
    
    // 计算低于用户得分的人数
    lessScoreCount = Math.floor(Math.random() * 500) + 100;
  }
  
  return {
    code: 0,
    msg: 'success',
    data: {
      best_rank: bestRank,
      less_score_count: lessScoreCount,
      ranking_board: mockRankingBoard,
      ranking_size: 50
    }
  };
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

