// src/utils/request.js
// import { useBaseStore } from '../stores/baseStore'; // 移除此行
import { useGameStore } from '../stores/gameStore';
import { useUserStore } from '../stores/userStore'; // Adjust path if needed, assuming stores is sibling to utils

export async function request (path, options = {}) {
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
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
  const apiUrl = VITE_API_BASE_URL + path;

  try {
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
      console.error('API Request Failed Details:', errorData);
      throw new Error(errorData.message);
    }

    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return undefined; 
    }

    return await response.json();
  } catch (error) {
    console.error(`Error during API request to ${apiUrl} (network error):`, error);
    throw error; 
  }
} 

// 游戏结束时调用submitAndFetchRealLeaderboardData
export async function submitAndFetchRealLeaderboardData() {
  const userStore = useUserStore();
  const gameStore = useGameStore();

  const requestBody = {
    q36: userStore.qimei36,
    level: gameStore.sessionLevelsCompleted,
    balls: gameStore.sessionBallsUsed,
    cups: gameStore.totalFallenCupsThisSession,
    trophies: gameStore.sessionTrophiesEarned
  };

  console.log('[submitAndFetchRealLeaderboardData] Request Body:', JSON.stringify(requestBody, null, 2));

  const requestPath = '/activity/pingpong/result'; // request helper 会自动添加 /api 前缀

  try {
    console.log(`[Request] Submitting game result to ${requestPath} via request helper`);
    // 使用 request 辅助函数发起 POST 请求
    const data = await request(requestPath, { 
      method: 'POST',
      body: JSON.stringify(requestBody),
      // headers 会由 request 辅助函数自动处理，包括 Content-Type 和其他基于 userStore 的头部
    });

    console.log('[Request] Successfully fetched real leaderboard data via request helper:', data);
    return data;

  } catch (error) {
    console.error(`Error in submitAndFetchRealLeaderboardData calling ${requestPath} via request helper:`, error);
    // request 辅助函数内部已经 console.error 了，这里可以根据需要选择是否再次打印或直接 re-throw
    throw error; // Re-throw the error to be caught by the caller
  }
} 

// Allow both named and default import
export default request;

// 获取活动总人数
export async function getPingPangPV() {
  try {
    console.log('开始调用 pingpong/pv API...');
    const response = await request('/activity/pingpong/pv', {
      method: 'GET'
    });
    console.log('pingpong/pv API 调用成功:', response);
    return response;
  } catch (error) {
    console.error('pingpong/pv API 调用失败:', error);
    throw error;
  }
}