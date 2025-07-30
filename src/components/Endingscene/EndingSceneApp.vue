<template>
  <div class="ending-scene-app">
    <!-- 背景容器 -->
    <div class="background-container">
      
      <!-- 恭喜文字 -->
      <div class="congratulation-text">
        {{ getUserDisplayText() }}
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
            你得到了 <span class="number-text">{{ gameData.stars }}</span> 分，{{ getRandomEncouragement() }}
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
        <span class="leaderboard-title-text">指尖游泳排行榜</span>
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
              <span class="player-name my-name">{{ currentUserData.nick }}</span>
              <span class="player-distance my-distance">{{ currentUserData.distance }}</span>
              <span class="player-score my-score">{{ currentUserData.stars }}</span>
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
              <span class="player-score">{{ player.score }}</span>
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
import audioManager from '../../utils/audio-manager';

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const userStore = useUserStore();

const currentUserData = ref(null);
const leaderboardData = ref([]);
const isLoadingApi = ref(false);
const apiError = ref(null);
const userName = ref(''); // 用户名

// 游戏数据
const gameData = computed(() => ({
  currentDistance: gameStateStore.finalDistance || gameStore.distance || 0,
  stars: gameStateStore.score || gameStore.stars || 0
}))

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

// 游戏操作科普文字（得分 < 6分）
const getGameTutorialText = () => {
  const tutorialTexts = [
    '点击左屏左移，点击右屏右移！',
    '收集星星获得高分！',
    '长按冲刺按钮可以加速前进！',
    '潜水镜道具让你无敌冲刺！',
    '多练习操作，熟能生巧！',
    '保持节奏，稳定操作是关键！',
    '观察前方障碍，提前做出反应！',
    '合理使用冲刺，节约能量很重要！',
    '星星越多分数越高，勇敢去收集！',
    '练好左右移动，是游戏的基础！'
  ]
  return tutorialTexts[Math.floor(Math.random() * tutorialTexts.length)]
}

// 鼓励话语（6分 ≤ 得分 < 50分）
const getEncouragementText = () => {
  const encouragements = [
    '很不错的开始！',
    '继续努力，你会更强！',
    '加油，再接再厉！',
    '勇敢前行，突破自我！',
    '坚持不懈，成功在望！',
    '挑战极限，永不放弃！',
    '稳步提升，再创佳绩！',
    '技术不错，继续精进！',
    '有潜力成为高手！',
    '距离目标越来越近了！'
  ]
  return encouragements[Math.floor(Math.random() * encouragements.length)]
}

// 夸奖话语（得分 ≥ 50分）
const getPraiseText = () => {
  const praiseTexts = [
    '太厉害了，真正的高手！',
    'amazing！技术超群！',
    '完美表现，堪称大师！',
    '惊人的技术，令人佩服！',
    '卓越成就，当之无愧！',
    '顶级水准，无人能及！',
    '传奇级别的表现！',
    '完美操作，技惊四座！',
    '大神级别，膜拜！',
    '超凡脱俗的技艺！',
    '王者风范，所向披靡！',
    '登峰造极，举世无双！'
  ]
  return praiseTexts[Math.floor(Math.random() * praiseTexts.length)]
}

// 根据得分获取对应的文字内容
const getScoreBasedText = () => {
  const score = gameData.value.stars
  
  if (score < 6) {
    return getGameTutorialText()
  } else if (score >= 6 && score < 50) {
    return getEncouragementText()
  } else {
    return getPraiseText()
  }
}

// 随机鼓励词函数（保留原函数以防其他地方使用）
const getRandomEncouragement = () => {
  // 现在直接调用基于得分的文字函数
  return getScoreBasedText()
}

// 获取用户显示文本
const getUserDisplayText = () => {
  console.log('[EndingSceneApp] getUserDisplayText调用，当前userName值:', userName.value);
  if (userName.value && userName.value.trim() !== '') {
    const displayText = `恭喜${userName.value}获得`;
    console.log('[EndingSceneApp] 显示用户名文本:', displayText);
    return displayText;
  } else {
    console.log('[EndingSceneApp] 显示默认文本: 恭喜您获得');
    return '恭喜您获得';
  }
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
    // 只有真正获取到有效用户名时才跳过
    if (userName.value && userName.value.trim() !== '' && userName.value.trim().length > 0) {
      console.log('[EndingSceneApp] 已从游戏API获取到有效用户名:', userName.value);
      return;
    }
    
    console.log('[EndingSceneApp] 当前userName为空或无效，尝试从腾讯新闻API获取:', userName.value);
    
    if (userStore.isInQQNewsApp && userStore.hasLogin) {
      const qqnewsApi = await import('@tencent/qqnews-jsapi');
      const { getUserInfo } = qqnewsApi.default || qqnewsApi;
      
      const userInfo = await getUserInfo();
      const fetchedName = userInfo?.nickname || userInfo?.name || '';
      
      if (fetchedName && fetchedName.trim() !== '') {
        userName.value = fetchedName.trim();
        console.log('[EndingSceneApp] 从腾讯新闻API获取到有效用户名:', userName.value);
      } else {
        console.log('[EndingSceneApp] 腾讯新闻API也未返回有效用户名');
      }
    } else {
      console.log('[EndingSceneApp] 不在腾讯新闻APP内或未登录，无法获取用户名');
    }
  } catch (error) {
    console.warn('[EndingSceneApp] 获取用户名失败:', error);
  }
}


onMounted(async () => { 
  console.log('[EndingSceneApp] Component mounted.');
  userStore.logCurrentPlayStats('[EndingSceneApp] Stats onMount');

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

      // ✅ 修改1：简化击败百分比计算 - 直接使用API返回的数据
      const lessScoreCount = apiData.less_score_count || 0;
      const rankingSize = apiData.ranking_size || 50;
      const defeatPercentage = Math.max(0, Math.min(99, Math.floor(lessScoreCount / rankingSize * 100)));
      
      console.log(`[EndingSceneApp] 简化击败比例计算: less_score_count=${lessScoreCount}, ranking_size=${rankingSize} -> 战胜${defeatPercentage}%`);

      // ✅ 修改2：从API返回的用户信息中获取昵称
      let userNickFromAPI = '';
      
      // 打印API返回的用户信息结构，用于调试
      console.log('[EndingSceneApp] API返回的用户信息调试:', {
        hasUserInfo: !!apiData.user_info,
        userInfo: apiData.user_info,
        nick: apiData.user_info?.nick,
        nickType: typeof apiData.user_info?.nick,
        nickLength: apiData.user_info?.nick?.length
      });
      
      if (apiData.user_info && apiData.user_info.nick && apiData.user_info.nick.trim() !== '') {
        userNickFromAPI = apiData.user_info.nick.trim();
        userName.value = userNickFromAPI;
        console.log('[EndingSceneApp] 从API获取到用户昵称:', userNickFromAPI);
      } else {
        console.log('[EndingSceneApp] API未返回有效的用户昵称，userName保持原值:', userName.value);
      }

      // ✅ 修改3：直接使用API返回的排名数据
      let currentRank = '未上榜';
      
      // 检查多种可能的排名数据来源
      if (apiData.ranking && apiData.ranking.rank) {
        currentRank = apiData.ranking.rank;
        console.log('[EndingSceneApp] 从API获取到排名 (apiData.ranking.rank):', currentRank);
      } else if (apiData.best_rank && apiData.best_rank.rank) {
        currentRank = apiData.best_rank.rank;
        console.log('[EndingSceneApp] 从API获取到排名 (apiData.best_rank.rank):', currentRank);
      } else if (apiData.current_rank) {
        currentRank = apiData.current_rank;
        console.log('[EndingSceneApp] 从API获取到排名 (apiData.current_rank):', currentRank);
      } else {
        console.log('[EndingSceneApp] 未找到排名数据，使用默认值: 未上榜');
        console.log('[EndingSceneApp] API数据调试:', {
          hasRanking: !!apiData.ranking,
          rankingRank: apiData.ranking?.rank,
          hasBestRank: !!apiData.best_rank,
          bestRankRank: apiData.best_rank?.rank,
          hasCurrentRank: !!apiData.current_rank,
          currentRank: apiData.current_rank
        });
      }
      
      // 确保排名是有效的数字或字符串
      if (currentRank && currentRank !== '未上榜') {
        // 如果是数字，确保它是正整数
        if (typeof currentRank === 'number' && currentRank > 0) {
          currentRank = currentRank;
        } else if (typeof currentRank === 'string' && !isNaN(parseInt(currentRank)) && parseInt(currentRank) > 0) {
          currentRank = parseInt(currentRank);
        } else {
          console.warn('[EndingSceneApp] 排名数据无效:', currentRank, '，使用默认值');
          currentRank = '未上榜';
        }
      }
      
      console.log('[EndingSceneApp] 最终确定的排名:', currentRank);

      // ✅ 获取历史最佳成绩数据
      let bestDistance = gameData.value.currentDistance;  // 默认使用当次成绩
      let bestStars = gameData.value.stars;              // 默认使用当次得分
      
      // 如果API返回了历史最佳成绩，则使用历史最佳
      if (apiData.best_rank && apiData.best_rank.score) {
        const bestScore = apiData.best_rank.score;
        bestStars = Math.floor(bestScore / 100000);
        bestDistance = bestScore % 100000;
        console.log('[EndingSceneApp] 使用历史最佳成绩: 得分=' + bestStars + ', 距离=' + bestDistance);
      } else {
        console.log('[EndingSceneApp] 未找到历史最佳成绩，使用当次游戏成绩');
      }

      // 设置当前用户数据（使用API返回的数据）
      currentUserData.value = {
        rank: currentRank,                                 // 使用API返回的排名
        nick: userName.value || displayNick.value,        // ✅ 修改1：优先使用从API获取的用户名
        distance: bestDistance,                           // ✅ 修改2：使用历史最佳距离
        stars: bestStars,                                 // ✅ 修改2：使用历史最佳得分
        rankPercent: defeatPercentage                     // 使用简化计算的击败百分比
      }

      // 设置排行榜数据
      if (apiData.ranking_board && Array.isArray(apiData.ranking_board)) {
        leaderboardData.value = apiData.ranking_board.map(entry => {
          // 从score中解析出stars和distance（score = stars * 100000 + distance）
          const totalScore = entry.ranking.score || 0;
          const stars = Math.floor(totalScore / 100000);
          const distance = totalScore % 100000;
          
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
  
  // 在API数据处理完成后，如果还没有用户名，则尝试从腾讯新闻API获取
  await getUserName();
})

const handleRestartGame = async () => {
  // 播放按钮音效
  audioManager.playSoundEffect('button')
  
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
  // 播放按钮音效
  audioManager.playSoundEffect('button')
  
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
    shareContent = '别怀疑，你也游不到500米！一起来游泳挑战！';
  } else {
    shareContent = '我成功游了' + distance + 'm，得了' + (currentUserData.value?.stars || gameStateStore.score || 0) + '分，超越' + rankPercent + '%的网友。夺冠有大奖！一起来游泳挑战！';
  }

  try {
    console.log('[EndingSceneApp] Setting share info...');
    
    setShareInfo({
      title: '指尖游泳挑战赛_腾讯新闻',
      longTitle: shareContent,
      content: shareContent,
      url: 'https://view.inews.qq.com/a/LNK2025072504936600?no-redirect=1',
      imgUrl: 'https://inews.gtimg.com/newsapp_bt/0/0728165827428_3945/0', 
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
  background-color: rgb(127, 228, 255);
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
  color: rgb(37, 96, 112); /* 设计稿文字色：深蓝绿色 */
}

/* 称号区域 */
.title-section {
  position: relative;
  margin-top: 1vh;
  left: 0;
  width: 89.6vw;
  height: 11vh; /* 从10.5vh改为11vh */
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
  -webkit-text-stroke: 0.7px #72332E; /* 修改描边为0.7px */
}

.title-text {
  font-family: 'MFYuanHei', 'PingFang SC', sans-serif;
  font-size: 22vw; /* 从20vw改为22vw */
  font-weight: bold;
  color: rgb(255, 121, 121);
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
  font-size: 22vw !important; /* 从inherit改为22vw !important */
  color: inherit;
  -webkit-text-stroke: inherit;
  flex-shrink: 0;
  font-family: 'MFYuanHei', 'PingFang SC', sans-serif;
  font-weight: bold;
}

/* 结果描述 */
.result-description {
  position: relative;
  margin-top: 1vh;
  left: 0;
  width: 89.07vw;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 4.5vw; /* 从5.33vw改为4.5vw */
  line-height: 1.4;
  color: rgb(37, 96, 112); /* 设计稿文字色：深蓝绿色 */
}

.score-line,
.distance-line {
  margin-bottom: 1.33vw;
}

.number-text {
  font-family: 'RadikalW01Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: rgb(255, 121, 121); /* 设计稿强调色：橙红色 */
}

/* 排行榜标题 */
.leaderboard-title {
  position: relative;
  margin-top: 1vh;
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 改为靠左对齐 */
  gap: 2.13vw;
}

.rank-icon {
  width: 3.47vw;
  height: 3.47vw;
}

.leaderboard-title .leaderboard-title-text {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 4vw;
  line-height: 1.4;
  color: rgb(37, 96, 112); /* 设计稿文字色：深蓝绿色 */
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
  color: rgb(37, 96, 112); /* 设计稿表头色：深蓝绿色 */
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
  color: rgb(11, 11, 11); /* 设计稿排名数字色：深色 */
}

.my-rank {
  color: rgb(255, 253, 223); /* 设计稿我的成绩文字色：淡黄色 */
}

.player-name {
  width: 26.67vw;
  text-align: left;
  padding-left: 5.33vw;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  color: rgb(11, 11, 11); /* 设计稿一般行文字色：深色 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.my-name {
  color: rgb(255, 253, 223); /* 设计稿我的成绩文字色：淡黄色 */
}

.player-distance {
  width: 23.73vw;
  text-align: center;
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: rgb(11, 11, 11); /* 设计稿一般行文字色：深色 */
}

.my-distance {
  color: rgb(255, 253, 223); /* 设计稿我的成绩文字色：淡黄色 */
}

.player-score {
  width: 24vw;
  text-align: center;
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: rgb(11, 11, 11); /* 设计稿一般行文字色：深色 */
}

.my-score {
  color: rgb(255, 253, 223); /* 设计稿我的成绩文字色：淡黄色 */
}

/* 底部渐变 */
.bottom-gradient {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15vh;
  background: linear-gradient(180deg, transparent 0%, rgba(127, 228, 255, 0.9) 60%, rgba(127, 228, 255, 1) 100%); /* 使用设计稿背景色渐变 */
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
  height: auto; /* 从5.5vh改为auto */
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}

.try-again-btn,
.share-btn {
  width: 42.67vw;
  height: auto; /* 从5.5vh改为auto */
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