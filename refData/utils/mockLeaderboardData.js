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
 * 生成随机玩家昵称
 * @returns {string}
 */
function getRandomNick() {
  const prefixes = ["开心", "快乐", "勇敢的", "智慧的", "敏捷的", "无敌的"];
  const names = ["小猪", "小兔", "老虎", "狮子", "猎豹", "悟空", "超人", "闪电"];
  const suffixes = ["玩家", "大神", "选手", "侠客", "精灵"];
  return `${prefixes[getRandomInt(0, prefixes.length - 1)]}${names[getRandomInt(0, names.length - 1)]}${suffixes[getRandomInt(0, suffixes.length - 1)]}_${getRandomInt(100, 999)}`;
}

/**
 * 生成模拟排行榜数据
 * @returns {{top50: Array<Object>, currentUser: Object}}
 */
export function generateMockLeaderboardData() {
  const top50 = [];
  for (let i = 0; i < 50; i++) {
    top50.push({
      rank: i + 1,
      nick: getRandomNick(),
      levelsCompleted: getRandomInt(50, 150 - i), // 排名越高，闯关数倾向越高
      cupsDropped: getRandomInt(80, 300 - i * 2), // 排名越高，用球数倾向越低（这里假设用球数越少越好）
      isCurrentUser: false, // 默认都不是当前用户
    });
  }

  // 生成一个当前用户数据，模拟其排名在列表之外的情况
  const currentUser = {
    rank: 176, // 与图片示例相似
    nick: "大白兔吃奶糖", // 与图片示例相似
    levelsCompleted: 26, // 与图片示例相似
    cupsDropped: 86,  // 与图片示例相似
    isCurrentUser: true,
  };

  // （可选）如果需要，可以尝试将 currentUser 插入 top50，或者替换 top50 中的某一项
  // 例如，如果 currentUser.rank <= 50，则可以替换对应排名的玩家
  // 但根据你的描述，currentUser 数据是分开的，所以我们暂时这样处理

  return {
    top50,
    currentUser,
  };
}

// 示例用法
// const leaderboardData = generateMockLeaderboardData();
// console.log(leaderboardData.currentUser);
// console.log(leaderboardData.top50.slice(0, 3)); 