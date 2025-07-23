/**
 * 生成随机整数
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number}
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成随机游泳玩家昵称
 * @returns {string}
 */
function getRandomNick() {
  const prefixes = ["游泳", "自由泳", "蛙泳", "仰泳", "蝶泳", "水中", "快速", "灵活"];
  const names = ["健将", "大师", "专家", "高手", "王者", "飞鱼", "海豚", "鲨鱼", "达人"];
  const suffixes = ["", "001", "666", "999", "Pro", "Max"];
  
  const prefix = prefixes[getRandomInt(0, prefixes.length - 1)];
  const name = names[getRandomInt(0, names.length - 1)];
  const suffix = suffixes[getRandomInt(0, suffixes.length - 1)];
  
  return `${prefix}${name}${suffix}`;
}

/**
 * 生成游泳游戏模拟排行榜数据
 * @param {number} count 生成的玩家数量
 * @returns {{leaderboardEntries: Array<Object>, currentUserEntry: Object}}
 */
export function generateSwimmingMockLeaderboardData(count = 50) {
  const leaderboardEntries = [];
  
  for (let i = 0; i < count; i++) {
    const rank = i + 1;
    // 排名越高，距离和星星数倾向越高
    const distance = getRandomInt(1000 - rank * 15, 1200 - rank * 10);
    const stars = getRandomInt(Math.max(1, 50 - rank), Math.max(5, 80 - rank));
    
    leaderboardEntries.push({
      rank: rank,
      nick: getRandomNick(),
      distance: Math.max(100, distance),
      stars: Math.max(1, stars),
      score: Math.max(1, stars), // 保持与stars一致
    });
  }

  // 生成一个当前用户数据，模拟其排名在列表之外的情况
  const currentUserEntry = {
    rank: getRandomInt(51, 500), // 排名在50名之外
    nick: "我",
    distance: getRandomInt(200, 800),
    stars: getRandomInt(5, 30),
    score: getRandomInt(5, 30),
  };

  return {
    leaderboardEntries,
    currentUserEntry,
  };
}

/**
 * 生成游泳游戏结果的模拟API响应
 * @param {Object} gameData 游戏数据
 * @returns {Object} 模拟的API响应
 */
export function generateSwimmingMockApiResponse(gameData) {
  const { leaderboardEntries, currentUserEntry } = generateSwimmingMockLeaderboardData(50);
  
  // 计算排名百分比
  const totalPlayers = 10000; // 假设总玩家数
  const rankPercent = Math.floor((1 - currentUserEntry.rank / totalPlayers) * 100);
  
  return {
    code: 0,
    message: 'success',
    data: {
      leaderboardEntries: leaderboardEntries,
      currentUserEntry: {
        ...currentUserEntry,
        distance: gameData.distance || currentUserEntry.distance,
        stars: gameData.stars || currentUserEntry.stars,
        score: gameData.score || currentUserEntry.score,
      },
      rankPercent: `${rankPercent}%`,
      best: {
        rank: Math.max(1, currentUserEntry.rank - getRandomInt(10, 50)),
        distance: gameData.distance + getRandomInt(50, 200),
        stars: gameData.stars + getRandomInt(5, 15),
      },
    },
  };
}

// 示例用法
// const mockData = generateSwimmingMockLeaderboardData();
// console.log(mockData.currentUserEntry);
// console.log(mockData.leaderboardEntries.slice(0, 3)); 

// const apiResponse = generateSwimmingMockApiResponse({ distance: 500, stars: 25, score: 25 });
// console.log(apiResponse); 