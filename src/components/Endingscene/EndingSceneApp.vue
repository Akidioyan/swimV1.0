<template>
  <div class="ending-scene-app">
    <!-- 背景容器 -->
    <div class="background-container">
      
      <!-- 恭喜文字 -->
      <div class="congratulation-text">
        {{ userName ? `恭喜${userName}获得` : '恭喜您获得' }}
      </div>
      
      <!-- 称号区域 -->
      <div class="title-section">
        <div class="user-title">
          <div class="title-text">
            <span 
              v-for="(char, index) in getTitleByDistance(gameData.currentDistance).split('')" 
              :key="index"
              class="title-char"
            >
              {{ char }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 结果描述文字 -->
      <div class="result-description">
        <template v-if="gameData.currentDistance === 0">
          再次挑战！
        </template>
        <template v-else>
          <div class="score-line">
            你得到了 <span class="number-text">{{ gameData.stars }}</span> 分，
            <span v-if="currentUserData?.rank > 50">{{ getRandomRankingText() }}</span>
            <span v-else-if="currentUserData?.rank === '未上榜'">{{ getRandomEncouragementText() }}</span>
            <span v-else>排名第 <span class="number-text">{{ currentUserData?.rank }}</span> 名！</span>
          </div>
          <div class="distance-line">
            你游了 <span class="number-text">{{ gameData.currentDistance }}</span> 米，
            已超越 <span class="number-text">{{ currentUserData?.rankPercent || '0' }}%</span> 网友！
          </div>
        </template>
      </div>
      
      <!-- 排行榜标题 -->
      <div class="leaderboard-title">
        <img src="/vector/RankIcon.svg" class="rank-icon" alt="排行榜图标">
        <span class="title-text">指尖游泳排行榜</span>
      </div>
      
      <!-- 排行榜容器 -->
      <div class="leaderboard-container">
        <!-- 表头 -->
        <div class="leaderboard-header">
          <span class="header-rank">排名</span>
          <span class="header-name">名称</span>
          <span class="header-distance">距离</span>
          <span class="header-score">得分</span>
        </div>
        
        <!-- 可滚动的排行榜列表 -->
        <div class="leaderboard-scroll-container">
          <!-- 我的成绩（第一位，特殊样式） -->
          <div v-if="currentUserData" class="my-result-row">
            <div class="ranking-bg-container">
              <img src="/vector/MeRankingList.svg" class="ranking-bg" alt="我的排名背景">
            </div>
            <div class="ranking-content">
              <span class="rank-number my-rank">{{ currentUserData.rank || '未上榜' }}</span>
              <span class="player-name my-name">{{ displayNick }}</span>
              <span class="player-distance my-distance">{{ currentUserData.distance || gameData.currentDistance }}</span>
              <span class="player-score my-score">{{ currentUserData.stars || gameData.stars }}</span>
            </div>
          </div>
          
          <!-- 扩展排行榜列表（50人） -->
          <div 
            v-for="(player, index) in displayLeaderboard" 
            :key="index"
            class="ranking-row"
          >
            <div class="ranking-bg-container">
              <img src="/vector/RankingList.svg" class="ranking-bg" alt="排名背景">
            </div>
            <div class="ranking-content">
              <span class="rank-number">{{ player.rank }}</span>
              <span class="player-name">{{ player.nick }}</span>
              <span class="player-distance">{{ player.distance }}</span>
              <span class="player-score">{{ player.stars || player.score }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 底部渐变遮罩 -->
      <div class="bottom-gradient"></div>
      
      <!-- 分享提示（当无法继续游戏时显示） -->
      <!-- 删除分享提示（当无法继续游戏时显示） -->
      <!-- <div v-if="showPlayLimitOverlay" class="share-tips">
      <img src="/needShareToPlayTips.png" alt="分享给好友，获得3次挑战机会" class="tips-background">
      </div> -->
      
      <!-- 底部按钮 -->
      <div class="bottom-buttons">
        <button 
          @click="handleRestartGame" 
          class="try-again-btn"
        >
          <img src="/tryAgain.png" alt="再挑战一次" class="btn-image">
        </button>
        
        <button 
          @click="handleShareInApp" 
          class="share-btn"
        >
          <img src="/shareToFriend.png" alt="分享给朋友" class="btn-image">
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useGameStore } from '../../stores/gameStore'
import { useGameStateStore } from '../../stores/gamestore/gameState'
import { useUserStore } from '../../stores/userStore';
import { setShareInfo, showShareMenu } from '@tencent/qqnews-jsapi'
import { reportSwimmingGameResult, getActivityPV } from '../../utils/request';
import { clickReport } from '../../utils/report';

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const userStore = useUserStore();

const currentUserData = ref(null);
const leaderboardData = ref([]);
const isLoadingApi = ref(false);
const apiError = ref(null);
const userName = ref(''); // 用户名

// 游戏次数限制相关状态
const showPlayLimitOverlay = ref(false);
const isTryAgainDisabled = ref(false);
const tipsImageRef = ref(null);

// 游戏数据
const gameData = computed(() => ({
  currentDistance: gameStateStore.finalDistance || gameStore.distance || 0,
  stars: gameStateStore.score || gameStore.stars || 0
}))

// 解析score为星星数和距离的函数
const parseScoreToStarsAndDistance = (score) => {
  const stars = Math.floor(score / 100000)
  const distance = score % 100000
  return { stars, distance }
}

// 计算击败百分比的函数
const calculateDefeatPercentage = (userRank, lessScoreCount, rankingSize) => {
  if (userRank && typeof userRank === 'number' && userRank > 0) {
    if (userRank === 1) {
      return 100;
    } else {
      const totalParticipants = Math.max(rankingSize || 50, userRank * 2);
      const defeatedCount = totalParticipants - userRank;
      return Math.min(Math.round((defeatedCount / totalParticipants) * 100), 99);
    }
  }
  
  if (!rankingSize || rankingSize === 0) return 0;
  return Math.min(Math.round((lessScoreCount / rankingSize) * 100), 99);
}

// 根据距离获取称号
const getTitleByDistance = (distance) => {
  if (distance >= 320) return '泳坛传奇'
  if (distance >= 280) return '泳坛王者'
  if (distance >= 240) return '水中蛟龙'
  if (distance >= 200) return '浪里白条'
  if (distance >= 160) return '浪里飞鱼'
  if (distance >= 120) return '泳池新星'
  if (distance >= 80) return '水中精灵'
  if (distance >= 40) return '泳池新手'
  return '初出茅庐'
}

// 未上榜提示词数组
const getRandomEncouragementText = () => {
  const encouragementTexts = [
    '继续挑战！',
    '再接再厉！',
    '突破极限！',
    '勇敢前行！',
  ]
  return encouragementTexts[Math.floor(Math.random() * encouragementTexts.length)]
}

// 排名不佳提示词数组
const getRandomRankingText = () => {
  const rankingTexts = [
    '继续挑战冲击排行！',
    '再接再厉！',
    '向更高名次进发！',
    '排行榜在等你！',
  ]
  return rankingTexts[Math.floor(Math.random() * rankingTexts.length)]
}

// 显示的排行榜数据（前50名）
const displayLeaderboard = computed(() => {
  return leaderboardData.value.slice(0, 50).map(player => ({
    ...player,
    stars: player.score || player.stars || 0
  }))
})

// 显示昵称
const displayNick = computed(() => {
  try {
    if (userStore.hasLogin === true) {
      return "我";
    } else if (userStore.hasLogin === false) {
      return "我(登录后进入榜单)";
    }
    return "我";
  } catch (e) {
    console.warn('[EndingSceneApp] Error accessing userStore.hasLogin for displayNick, defaulting to "我"', e);
    return "我";
  }
});

// 获取用户名
const getUserName = async () => {
  try {
    if (userStore.isInQQNewsApp && userStore.hasLogin) {
      const qqnewsApi = await import('@tencent/qqnews-jsapi');
      const { getUserInfo } = qqnewsApi.default || qqnewsApi;
      
      const userInfo = await getUserInfo();
      userName.value = userInfo?.nickname || userInfo?.name || '';
      console.log('[EndingSceneApp] 获取到用户名:', userName.value);
    } else {
      userName.value = '';
      console.log('[EndingSceneApp] 使用空用户名');
    }
  } catch (error) {
    console.warn('[EndingSceneApp] 获取用户名失败，使用空值:', error);
    userName.value = '';
  }
}


onMounted(async () => { 
  console.log('[EndingSceneApp] Component mounted.');
  userStore.logCurrentPlayStats('[EndingSceneApp] Stats onMount');

  // 获取用户名
  await getUserName();
  
  console.log('[EndingSceneApp] Attempting to fetch swimming game leaderboard data...');
  isLoadingApi.value = true;
  apiError.value = null;
  
  try {
    // 获取真实的PV数据
    let realCurrentPV = 100;
    try {
      console.log('[EndingSceneApp] 获取真实PV数据...');
      const pvResponse = await getActivityPV();
      if (pvResponse && pvResponse.data && pvResponse.data.current_pv) {
        realCurrentPV = parseInt(pvResponse.data.current_pv);
        console.log('[EndingSceneApp] 获取到真实current_pv:', realCurrentPV);
      } else if (pvResponse && pvResponse.current_pv) {
        realCurrentPV = parseInt(pvResponse.current_pv);
        console.log('[EndingSceneApp] 获取到真实current_pv:', realCurrentPV);
      }
    } catch (pvError) {
      console.error('[EndingSceneApp] 获取PV数据失败，使用默认值:', pvError);
    }

    // 上报游戏结果并获取排行榜数据
    const gameResultData = {
      distance: gameData.value.currentDistance,
      score: gameData.value.stars,
      stars: gameData.value.stars,
      survivalTime: gameStore.survivalTime || gameStateStore.survivalTime || 0,
      gameTime: gameStore.gameTime || gameStateStore.gameTime || 0,
      gameEndReason: gameStore.gameEndReason || gameStateStore.gameEndReason || 'completed',
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent
    }
    
    const realDataResponse = await reportSwimmingGameResult(gameResultData)
    console.log('[EndingSceneApp] Real data received from API:', JSON.parse(JSON.stringify(realDataResponse)));

    if (realDataResponse && realDataResponse.code === 0 && realDataResponse.data) {
      const apiData = realDataResponse.data;

      // 计算击败百分比
      const userRank = apiData.best_rank?.rank;
      const defeatPercentage = calculateDefeatPercentage(
        userRank,
        apiData.less_score_count || 0,
        apiData.ranking_size || 50
      )
      
      console.log(`[EndingSceneApp] 战胜比例计算: 排名${userRank}, less_score_count=${apiData.less_score_count}, ranking_size=${apiData.ranking_size} -> 战胜${defeatPercentage}%`);

      // 设置当前用户数据
      if (apiData.best_rank) {
        const { stars, distance } = parseScoreToStarsAndDistance(apiData.best_rank.score)
        currentUserData.value = {
          rank: apiData.best_rank.rank,
          nick: displayNick.value,
          distance: distance,
          stars: stars,
          rankPercent: defeatPercentage
        }
      } else {
        currentUserData.value = {
          rank: '未上榜',
          nick: displayNick.value,
          distance: gameData.value.currentDistance,
          stars: gameData.value.stars,
          rankPercent: defeatPercentage
        }
      }

      // 设置排行榜数据
      if (apiData.ranking_board && Array.isArray(apiData.ranking_board)) {
        leaderboardData.value = apiData.ranking_board.map(entry => {
          const { stars, distance } = parseScoreToStarsAndDistance(entry.ranking.score)
          return {
            rank: entry.ranking.rank,
            nick: (entry.user_info.nick && entry.user_info.nick.trim() !== '') ? entry.user_info.nick : "游泳挑战者",
            distance: distance,
            stars: stars,
            score: stars,
            head_url: entry.user_info.head_url || ''
          }
        })
      } else {
        console.error('[EndingSceneApp] API response error or malformed data:', realDataResponse);
        apiError.value = realDataResponse?.msg || 'API request failed or returned malformed data';
        leaderboardData.value = [];
        currentUserData.value = {
          rank: '未上榜',
          nick: displayNick.value,
          distance: gameData.value.currentDistance,
          stars: gameData.value.stars,
          rankPercent: 0
        };
      }
    } else {
      console.error('[EndingSceneApp] API response error or malformed data:', realDataResponse);
      apiError.value = realDataResponse?.msg || 'API request failed or returned malformed data';
      leaderboardData.value = [];
      currentUserData.value = {
        rank: '未上榜',
        nick: displayNick.value,
        distance: gameData.value.currentDistance,
        stars: gameData.value.stars,
        rankPercent: 0
      };
    }
  } catch (error) {
    console.error('[EndingSceneApp] Error fetching leaderboard data:', error);
    apiError.value = 'Failed to load leaderboard data';
    leaderboardData.value = [];
    currentUserData.value = {
      rank: '未上榜',
      nick: displayNick.value,
      distance: gameData.value.currentDistance,
      stars: gameData.value.stars,
      rankPercent: 0
    };
  } finally {
    isLoadingApi.value = false;
  }
})

const handleRestartGame = async () => {
  userStore.logCurrentPlayStats('[EndingSceneApp] handleRestartGame clicked');
  
  // 检查端内APP用户是否已登录
  if (userStore.isInQQNewsApp && !userStore.hasLogin) {
    console.log('🚫 端内APP用户未登录，无法重新开始游戏');
    clickReport({
      id: 'restart_game_login_required',
    });
    return;
  }

  console.log('✅ 用户验证通过，重新开始游戏');
  
  clickReport({
    id: 'restart_game',
  });
  
  gameStateStore.restartGame()
}

const handleShareInApp = () => {
  userStore.logCurrentPlayStats('[EndingSceneApp] handleShareInApp clicked');
  console.log('[EndingSceneApp] Initiating in-app share...');
  
  // 检查腾讯新闻APP环境
  if (!userStore.isInQQNewsApp) {
    console.warn('[EndingSceneApp] Not in QQ News App environment, cannot use native share');
    alert('请在腾讯新闻APP内使用分享功能');
    return;
  }
  
  clickReport({
    id: 'share_in_app',
  })

  const distance = gameData.value.currentDistance;
  const rankPercent = currentUserData.value?.rankPercent || 0;
  let shareContent = '';

  if (distance === 0) {
    shareContent = '用指尖与全网游泳高手对决，一起来游泳挑战！';
  } else {
    shareContent = '成功挑战游了' + distance + 'm，超全网' + rankPercent + '%的网友，一起来游泳挑战！';
  }

  try {
    console.log('[EndingSceneApp] Setting share info...');
    
    setShareInfo({
      title: '指尖游泳挑战赛_腾讯新闻',
      longTitle: shareContent,
      content: shareContent,
      url: 'https://view.inews.qq.com/a/LNK2025072504936600?no-redirect=1',
      imgUrl: 'https://inews.gtimg.com/newsapp_bt/0/072511375722_7655/0', 
    });

    console.log('[EndingSceneApp] Attempting to show share menu...');
    showShareMenu();
    console.log('[EndingSceneApp] Share menu called. Starting 5s timer for bonus plays.');
    
    // 分享后奖励3次额外游戏机会
    setTimeout(() => {
      console.log('[EndingSceneApp] 5s timer elapsed. Granting bonus plays for in-app share.');
      userStore.grantBonusPlays(3);
    }, 5000);

  } catch (error) {
    console.error('[EndingSceneApp] Failed to initiate share:', error);
    try {
      showShareMenu();
      console.log('[EndingSceneApp] Fallback: Direct share menu called.');
    } catch (fallbackError) {
      console.error('[EndingSceneApp] Fallback share also failed:', fallbackError);
      alert('分享功能暂时不可用，请稍后重试');
    }
  }
}
</script>

<style scoped>
/* 导入字体 */
@import url('https://fonts.googleapis.com/css2?family=PingFang+SC:wght@300;400;600&display=swap');

.ending-scene-app {
  width: 100%;
  height: 100vh;
  background-color: #171717;
  position: relative;
  overflow-y: hidden;
  overflow-x: hidden;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .ending-scene-app {
    height: 100dvh;
  }
}

.background-container {
  width: 100%;
  height: 100vh;
  position: relative;
  padding: 0 5.33vw;
  box-sizing: border-box;
  overflow: hidden;
  padding-bottom: 30vh;
}

/* 恭喜文字 */
.congratulation-text {
  position: relative;
  margin-top: 2vh;
  left: 0;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 4vw;
  line-height: 1.4;
  color: #E7E7E7;
}

/* 称号区域 */
.title-section {
  position: relative;
  margin-top: 1vh;
  left: 0;
  width: 89.6vw;
  height: 10.5vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}

.user-title {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.title-text {
  font-family: 'MFYuanHei', 'PingFang SC', sans-serif;
  font-size: 20vw;
  font-weight: bold;
  color: #5CBBF9;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  letter-spacing: 0;
  line-height: 0.8;
  text-align: left;
}

.title-char {
  display: inline-block;
  line-height: 0.8;
  font-size: inherit;
  color: inherit;
  text-shadow: inherit;
  flex-shrink: 0;
}

/* 结果描述 */
.result-description {
  position: relative;
  margin-top: 1vh;
  left: 0;
  width: 89.07vw;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 5.33vw;
  line-height: 1.4;
  color: #E7E7E7;
}

.score-line,
.distance-line {
  margin-bottom: 1.33vw;
}

.number-text {
  font-family: 'RadikalW01Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: #5CBBF9;
}

/* 排行榜标题 */
.leaderboard-title {
  position: relative;
  margin-top: 1vh;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.13vw;
}

.rank-icon {
  width: 3.47vw;
  height: 3.47vw;
}

.leaderboard-title .title-text {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 4vw;
  line-height: 1.4;
  color: #FFFFFF;
}

/* 排行榜容器 */
.leaderboard-container {
  position: relative;
  margin-top: 1vh;
  left: 0;
  width: 89.6vw;
  height: 75vh;
  margin-left: auto;
  margin-right: auto;
}

/* 表头 */
.leaderboard-header {
  display: flex;
  align-items: center;
  height: 3.5vh;
  margin-bottom: 1vh;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 3.2vw;
  color: #606060;
}

.header-rank {
  width: 15.2vw;
  text-align: center;
}

.header-name {
  width: 26.67vw;
  text-align: left;
  padding-left: 5.33vw;
}

.header-distance {
  width: 23.73vw;
  text-align: center;
}

.header-score {
  width: 24vw;
  text-align: center;
}

/* 可滚动的排行榜容器 */
.leaderboard-scroll-container {
  max-height: 53vh;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.leaderboard-scroll-container::-webkit-scrollbar {
  display: none;
}

/* 我的成绩行 */
.my-result-row {
  position: relative;
  width: 89.6vw;
  height: 5vh;
  margin-bottom: 1vh;
  flex-shrink: 0;
}

/* 排行榜行 */
.ranking-row {
  position: relative;
  width: 89.6vw;
  height: 5vh;
  margin-bottom: 1vh;
  flex-shrink: 0;
}

.ranking-bg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.ranking-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ranking-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 4vw;
  z-index: 2;
}

.rank-number {
  width: 15.2vw;
  text-align: center;
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: #0B0B0B;
}

.my-rank {
  color: #0B0B0B;
}

.player-name {
  width: 26.67vw;
  text-align: left;
  padding-left: 5.33vw;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  color: #E7E7E7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.my-name {
  color: #99CCFF;
}

.player-distance {
  width: 23.73vw;
  text-align: center;
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: #E7E7E7;
}

.my-distance {
  color: #E7E7E7;
}

.player-score {
  width: 24vw;
  text-align: center;
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: #E7E7E7;
}

.my-score {
  color: #E7E7E7;
}

/* 底部渐变 */
.bottom-gradient {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15vh;
  background: linear-gradient(180deg, transparent 0%, rgba(23, 23, 23, 0.9) 60%, rgba(23, 23, 23, 1) 100%);
  pointer-events: none;
  z-index: 1;
}

/* 分享提示 */
.share-tips {
  position: fixed;
  bottom: 9vh;
  left: 5.07vw;
  width: 53.87vw;
  height: 4.5vh;
  z-index: 2;
}

.tips-background {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

/* 底部按钮 */
.bottom-buttons {
  position: fixed;
  bottom: 3.5vh;
  left: 5.33vw;
  width: 89.6vw;
  height: 5.5vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}

.try-again-btn,
.share-btn {
  width: 42.67vw;
  height: 5.5vh;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.try-again-btn:hover,
.share-btn:hover {
  transform: scale(1.05);
}

.try-again-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.try-again-btn.disabled:hover {
  transform: none;
}

.btn-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.tips-animate {
  animation: pulse-scale 0.5s ease-in-out;
}

@keyframes pulse-scale {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}
</style>