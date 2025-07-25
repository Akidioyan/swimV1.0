# 🏆 端外用户排行榜API功能

## 📋 功能概述

为端外用户提供获取服务器真实排行榜前50名数据的功能，替代之前的完全模拟数据方案。

## 🎯 技术实现

### 新增API接口

在 `src/utils/request.js` 中新增 `getRankingBoard` 函数：

```javascript
// 获取排行榜前50名（端外用户专用）
export async function getRankingBoard() {
  try {
    console.log('获取排行榜前50名数据...');
    
    const requestBody = {
      activity_id: activity_id,
      ranking_size: 50
    };
    
    const response = await request('/activity/ranking_board', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    
    // 格式化排行榜数据，添加解析后的星星数和距离
    const formattedResponse = formatRankingData(response);
    
    return formattedResponse;
    
  } catch (error) {
    console.error('排行榜前50名查询失败:', error);
    // 返回模拟数据作为降级处理
    const mockData = generateMockRankingData();
    return formatRankingData(mockData);
  }
}
```

### API接口差异

| 接口 | 路径 | 用途 | 用户类型 | 返回数据 |
|------|------|------|----------|----------|
| `getRankingOnly` | `/activity/ranking` | 获取个人排名+排行榜 | 端内用户 | 包含个人best_rank |
| `getRankingBoard` | `/activity/ranking_board` | 仅获取排行榜前50 | 端外用户 | 仅包含ranking_board |

### 请求参数

```javascript
{
  "activity_id": "swim_game",
  "ranking_size": 50
}
```

## 🚀 应用场景

### 1. **端外结束页面** - `EndingSceneOutside.vue`

```javascript
onMounted(async () => {
  try {
    // 用户数据使用假数据算法
    const currentDistance = gameData.value.currentDistance
    const defeatPercentage = calculateDefeatPercentage(currentDistance)
    const estimatedRank = calculateRankByDistance(currentDistance)
    
    // 用户数据仍使用假数据
    currentUserData.value = { 
      rankPercent: defeatPercentage.toString(),
      nickName: '您'
    }
    
    // 获取真实排行榜数据
    const rankingResponse = await getRankingBoard();
    if (rankingResponse && rankingResponse.data && rankingResponse.data.ranking_board) {
      leaderboardData.value = rankingResponse.data.ranking_board.map(entry => {
        return {
          rank: entry.ranking.rank,
          nick: entry.user_info.nick || "游泳挑战者",
          distance: entry.ranking.distance || 0,
          stars: entry.ranking.stars || 0,
          score: entry.ranking.stars || 0,
          head_url: entry.user_info.head_url || ''
        };
      });
    }
  } catch (error) {
    // 降级处理：使用模拟数据
    leaderboardData.value = generateMockLeaderboard();
  }
})
```

### 2. **排行榜弹窗** - `Leaderboard.vue`

```javascript
const fetchLeaderboardData = async () => {
  try {
    let response
    if (userStore.isInQQNewsApp) {
      // 端内用户：获取个人排名+排行榜
      response = await getRankingOnly()
    } else {
      // 端外用户：仅获取排行榜前50
      response = await getRankingBoard()
    }
    
    // 处理排行榜数据
    if (response && response.data && response.data.ranking_board) {
      leaderboardData.value = response.data.ranking_board.map(entry => {
        const { stars, distance } = parseScoreToStarsAndDistance(entry.ranking.score)
        return {
          rank: entry.ranking.rank,
          name: entry.user_info.nick || `游泳挑战者${entry.ranking.rank}`,
          distance: distance,
          score: stars,
          head_url: entry.user_info.head_url || ''
        }
      })
    }
    
    // 端内用户处理个人排名
    if (userStore.isInQQNewsApp && response.data.best_rank) {
      const { stars, distance } = parseScoreToStarsAndDistance(response.data.best_rank.score)
      bestRank.value = {
        rank: response.data.best_rank.rank,
        stars: stars,
        distance: distance
      }
    } else if (!userStore.isInQQNewsApp) {
      // 端外用户没有个人排名数据
      bestRank.value = null
    }
  } catch (error) {
    // 降级处理
    leaderboardData.value = mockLeaderboardData
  }
}
```

## 📊 数据流程对比

### 端内用户数据流程
```
1. 用户游戏结束
   ↓
2. 调用 submitGameResultAndGetRanking() 
   ↓ (POST /activity/ranking)
3. 服务器记录成绩 + 返回个人排名 + 排行榜前50
   ↓
4. 显示真实个人排名和排行榜
```

### 端外用户数据流程
```
1. 用户游戏结束
   ↓
2. 本地计算假数据排名和战胜百分比
   ↓
3. 调用 getRankingBoard()
   ↓ (POST /activity/ranking_board)  
4. 获取真实排行榜前50（不上传成绩）
   ↓
5. 显示假数据个人成绩 + 真实排行榜
```

## 🔄 降级处理

### API调用失败时的降级策略

1. **网络请求失败**：使用 `generateMockRankingData()` 生成模拟排行榜
2. **数据格式异常**：使用预设的 `mockLeaderboardData` 
3. **服务器错误**：自动降级到模拟数据，确保用户体验

### 降级日志示例

```javascript
console.error('[EndingSceneOutside] 获取排行榜数据失败，使用模拟数据:', rankingError);
console.warn('[Leaderboard] 排行榜API返回数据格式异常，使用模拟数据');
```

## 🎨 用户体验优化

### 端外用户体验特点

1. **个人数据**：基于游戏表现的合理假数据
   - 距离越远，排名越高、战胜百分比越高
   - 提供鼓励性的成就感

2. **排行榜数据**：服务器真实前50名
   - 展示真实的高手成绩
   - 激发用户挑战欲望

3. **数据一致性**：假数据算法确保逻辑合理
   - 距离 ≥ 320m：排名1-3，战胜90-99%
   - 距离 ≥ 280m：排名1-5，战胜70-89%  
   - 距离 ≥ 200m：排名5-25，战胜40-69%
   - 依此类推...

## 🛡️ 安全性考虑

1. **数据隔离**：端外用户成绩不影响真实排行榜
2. **假数据合理性**：基于算法确保假数据符合游戏逻辑
3. **降级保护**：API失败时自动降级，不影响用户体验
4. **请求验证**：activity_id 参数确保请求合法性

## 📈 技术优势

1. **性能优化**：端外用户无需上传成绩，减少服务器压力
2. **用户体验**：提供真实排行榜参考，增强游戏吸引力  
3. **数据准确性**：排行榜数据来自服务器，确保真实性
4. **系统稳定性**：多层降级保护，确保功能可用性

## 🎯 核心价值

通过 `getRankingBoard` 接口，端外用户能够：

1. **查看真实高手榜单**：了解游戏中的顶尖玩家成绩
2. **获得合理反馈**：个人假数据提供适当的成就感  
3. **保持游戏热情**：真实排行榜激发挑战动力
4. **享受稳定体验**：多重降级保护确保功能可用

这种混合数据策略既保护了排行榜的真实性，又为端外用户提供了良好的游戏体验！🎉 