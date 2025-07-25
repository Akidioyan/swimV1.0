<template>
  <div class="ending-scene-app">
    <!-- 背景容器 -->
    <div class="background-container">
      
      <!-- 恭喜文字 -->
      <div class="congratulation-text">
        恭喜您获得，{{ userName }}
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
            <span v-if="currentUserEntry?.rank > 50">{{ getRandomRankingText() }}</span>
            <span v-else-if="currentUserEntry?.rank === '未上榜'">{{ getRandomEncouragementText() }}</span>
            <span v-else>排名第 <span class="number-text">{{ currentUserEntry?.rank }}</span> 名！</span>
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
          <div v-if="currentUserEntry" class="my-result-row">
            <div class="ranking-bg-container">
              <img src="/vector/MeRankingList.svg" class="ranking-bg" alt="我的排名背景">
            </div>
            <div class="ranking-content">
              <span class="rank-number my-rank">{{ currentUserEntry.rank || '未上榜' }}</span>
              <span class="player-name my-name">{{ displayNick }}</span>
              <span class="player-distance my-distance">{{ currentUserEntry.distance || gameData.currentDistance }}</span>
              <span class="player-score my-score">{{ currentUserEntry.stars || gameData.stars }}</span>
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
      <div v-if="showPlayLimitOverlay" class="share-tips">
        <img src="/needShareToPlayTips.png" alt="分享给好友，获得3次挑战机会" class="tips-background">
      </div>
      
      <!-- 底部按钮 -->
      <div class="bottom-buttons">
        <button 
          @click="handleRestartGame" 
          class="try-again-btn" 
          :class="{ 'disabled': isTryAgainDisabled }"
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

const currentUserEntry = ref(null);
const leaderboardData = ref([]);
const isLoadingApi = ref(false);
const apiError = ref(null);
const currentUserData = ref(null);
const userName = ref(''); // 用户名

// New reactive state for play limits
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
  // 如果用户有明确排名，基于排名计算战胜百分比
  if (userRank && typeof userRank === 'number' && userRank > 0) {
    if (userRank === 1) {
      return 100; // 排名第一，战胜100%
    } else {
      // 基于排名计算：假设总参与人数为rankingSize，排名为rank的用户战胜了(rankingSize - rank) / rankingSize的人
      const totalParticipants = Math.max(rankingSize || 50, userRank * 2); // 确保总人数合理
      const defeatedCount = totalParticipants - userRank;
      return Math.min(Math.round((defeatedCount / totalParticipants) * 100), 99);
    }
  }
  
  // 如果没有排名，使用新的公式：less_score_count / ranking_size × 100%
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

// 未上榜提示词数组 - 根据游戏规则和游泳主题设计
const getRandomEncouragementText = () => {
  const encouragementTexts = [
    '继续挑战，冲击排行榜！',
    '再接再厉，向高分进发！',
    '加油游泳，突破自我极限！',
    '勇敢前行，下次必上榜！',
    '练好游泳技巧，排行榜等你！',
    '收集更多星星，冲击高分！',
    '掌握游泳节奏，再创佳绩！',
    '继续训练，成为游泳达人！',
    '不要放弃，排行榜在向你招手！',
    '提升游泳技能，下回称王！',
    '熟练切换泳道，避开更多障碍！',
    '星星是关键，多收集冲高分！',
    '坚持游泳，总有上榜的一天！',
    '挑战极限，超越更多网友！',
    '游泳高手就是你，再来一局！',
    '水中冲浪，再创游泳奇迹！',
    '蛙泳蝶泳，样样精通才能上榜！',
    '游泳姿势很重要，练好再来！',
    '呼吸管是神器，多多收集！',
    '游出风采，游出精彩人生！',
    '水花四溅，梦想在前方等你！',
    '每一次划水都是进步的开始！',
    '游泳路上无捷径，坚持就是胜利！',
    '乘风破浪，游向更高的山峰！'
  ]
  
  return encouragementTexts[Math.floor(Math.random() * encouragementTexts.length)]
}

// 排名不佳提示词数组 - 针对排名超过50的情况
const getRandomRankingText = () => {
  const rankingTexts = [
    '继续挑战，冲击排行榜！',
    '再接再厉，排名还能提升！',
    '努力游泳，向前50名进发！',
    '坚持练习，排行榜在等你！',
    '提升技巧，下次冲击更高排名！',
    '收集更多星星，排名自然上升！',
    '游泳技能待提升，加油冲榜！',
    '不要气馁，高排名指日可待！',
    '前50名不是梦，继续努力！',
    '游泳达人之路，从现在开始！',
    '每次进步一点点，排名自然往前冲！',
    '熟能生巧，排行榜等你来征服！'
  ]
  
  return rankingTexts[Math.floor(Math.random() * rankingTexts.length)]
}

// 显示的排行榜数据（前50名）
const displayLeaderboard = computed(() => {
  return leaderboardData.value.slice(0, 50).map(player => ({
    ...player,
    stars: player.score || player.stars || 0 // 兼容不同的数据格式
  }))
})

// Computed property for dynamic nickname
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
      // 尝试从腾讯新闻APP获取用户名
      const qqnewsApi = await import('@tencent/qqnews-jsapi');
      const { getUserInfo } = qqnewsApi.default || qqnewsApi;
      
      const userInfo = await getUserInfo();
      userName.value = userInfo?.nickname || userInfo?.name || '游泳达人';
      console.log('[EndingSceneApp] 获取到用户名:', userName.value);
    } else {
      // 使用默认用户名
      userName.value = '游泳达人';
      console.log('[EndingSceneApp] 使用默认用户名:', userName.value);
    }
  } catch (error) {
    console.warn('[EndingSceneApp] 获取用户名失败，使用默认值:', error);
    userName.value = '游泳达人';
  }
}

// Watch for changes in userStore.canPlay to update UI elements
watch(() => userStore.canPlay, (canStillPlay) => {
  console.log(`[EndingSceneApp] userStore.canPlay changed to: ${canStillPlay}`);
  isTryAgainDisabled.value = !canStillPlay;
  showPlayLimitOverlay.value = !canStillPlay;
  userStore.logCurrentPlayStats('[EndingSceneApp] Stats after canPlay changed');
}, { immediate: true });

onMounted(async () => { 
  console.log('[EndingSceneApp] Component mounted.');
  userStore.logCurrentPlayStats('[EndingSceneApp] Stats onMount');

  // 获取用户名
  await getUserName();
  
  console.log('[EndingSceneApp] Attempting to fetch swimming game leaderboard data...');
  isLoadingApi.value = true;
  apiError.value = null;
  try {
    // 1. 首先获取真实的PV数据
    let realCurrentPV = 100; // 默认值
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

    // 2. 上报游戏结果并获取排行榜数据
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

      // 3. 使用正确的公式计算击败百分比，优先使用排名逻辑
      const userRank = apiData.best_rank?.rank;
      const defeatPercentage = calculateDefeatPercentage(
        userRank, // 传递用户排名
        apiData.less_score_count || 0,
        apiData.ranking_size || 50  // 使用ranking_size替代totalPV
      )
      
      console.log(`[EndingSceneApp] 战胜比例计算: 排名${userRank}, less_score_count=${apiData.less_score_count}, ranking_size=${apiData.ranking_size} -> 战胜${defeatPercentage}%`);

      // 设置当前用户数据 - 使用best_rank信息
      if (apiData.best_rank) {
        const { stars, distance } = parseScoreToStarsAndDistance(apiData.best_rank.score)
        currentUserEntry.value = {
          rank: apiData.best_rank.rank,
          nick: displayNick.value,
          distance: distance,
          stars: stars
        }
      } else {
        currentUserEntry.value = {
          rank: '未上榜',
          nick: displayNick.value,
          distance: gameData.value.currentDistance,
          stars: gameData.value.stars
        }
      }

      // 设置排行榜数据 - 适配新的API格式
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
        currentUserEntry.value = {
          rank: '未上榜',
          nick: displayNick.value,
          distance: gameData.value.currentDistance,
          stars: gameData.value.stars
        };
        currentUserData.value = { rankPercent: '0' };
      }
   
  
  // 删除模拟排行榜数据生成函数

const handleRestartGame = async () => {
  userStore.logCurrentPlayStats('[EndingSceneApp] handleRestartGame clicked');
  
  // 检查端内APP用户是否已登录
  if (userStore.isInQQNewsApp && !userStore.hasLogin) {
    console.log('🚫 端内APP用户未登录，无法重新开始游戏');
    
    // 上报点击事件
    clickReport({
      id: 'restart_game_login_required',
    });
    
    return; // 阻止重新开始游戏
  }
  
  // 检查剩余游戏次数
  if (!userStore.canPlay) {
    if (tipsImageRef.value) {
      tipsImageRef.value.classList.add('tips-animate');
      setTimeout(() => {
        if (tipsImageRef.value) {
            tipsImageRef.value.classList.remove('tips-animate');
        }
      }, 500);
    }
    return;
  }
  
  console.log('✅ 用户验证通过，重新开始游戏');
  
  // 上报重新开始游戏事件
  clickReport({
    id: 'restart_game',
  });
  
  // 使用gameStateStore的重启方法
  gameStateStore.restartGame()
}

const handleShareInApp = () => {
  userStore.logCurrentPlayStats('[EndingSceneApp] handleShareInApp clicked');
  console.log('[EndingSceneApp] Initiating share...');
  
  clickReport({
    id: 'share_for_life',
  })

  const distance = gameData.value.currentDistance;
  const rankPercent = currentUserData.value?.rankPercent || 0;
  let shareContent = '';

  if (distance === 0) {
    shareContent = '用指尖与全网游泳高手对决，一起来游泳挑战！';
  } else {
    shareContent = '成功挑战游了' + distance + 'm，超全网' + rankPercent + '%的网友，一起来游泳挑战！';
  }

  setShareInfo({
    title: '指尖游泳挑战赛_腾讯新闻',
    longTitle: shareContent,
    content: shareContent,
    url: 'https://view.inews.qq.com/a/LNK2025052211684300?no-redirect=1',
    imgUrl: 'https://mat1.gtimg.com/rain/apub2019/42bd7e299fc4.shareimg.png', 
  });

  showShareMenu();
  console.log('[EndingSceneApp] Share menu shown.');
}
      // 设置用户数据
      currentUserData.value = { rankPercent: defeatPercentage };
      
      } else {
      console.error('[EndingSceneApp] API response error or malformed data:', realDataResponse);
      apiError.value = realDataResponse?.msg || 'API request failed or returned malformed data';
      leaderboardData.value = [];
      currentUserEntry.value = {
        rank: '未上榜',
        nick: displayNick.value,
        distance: gameData.value.currentDistance,
        stars: gameData.value.stars
      };
      currentUserData.value = { rankPercent: '0' };
    }
  } catch (error) {
    console.error('[EndingSceneApp] Error fetching leaderboard data:', error);
    apiError.value = 'Failed to load leaderboard data';
    leaderboardData.value = [];
    currentUserEntry.value = {
      rank: '未上榜',
      nick: displayNick.value,
      distance: gameData.value.currentDistance,
      stars: gameData.value.stars
    };
    currentUserData.value = { rankPercent: '0' };
  } finally {
    isLoadingApi.value = false;
  }
})
</script>

<style scoped>
/* 导入字体 */
@import url('https://fonts.googleapis.com/css2?family=PingFang+SC:wght@300;400;600&display=swap');

.ending-scene-app {
  width: 100%;
  height: 100vh;
  background-color: #171717;
  position: relative;
  overflow-y: auto;
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
  min-height: 100vh;
  position: relative;
  padding: 0 5.33vw; /* 20px at 375px width */
  box-sizing: border-box;
  height: auto;
  padding-bottom: 30vh;
}

/* 恭喜文字 */
.congratulation-text {
  position: relative; /* 从absolute改为relative */
  margin-top: 2vh; /* 保持顶部间距 */
  left: 0; /* 移除left定位，使用padding控制 */
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 4vw; /* 15px at 375px width */
  line-height: 1.4;
  color: #E7E7E7;
  /* 预估高度: 4vw * 1.4 ≈ 5.6vw ≈ 2.1vh */
}

/* 称号区域 */
.title-section {
  position: relative; /* 从absolute改为relative */
  margin-top: 1vh; /* 统一改为1vh间距 */
  left: 0; /* 移除left定位 */
  width: 89.6vw; /* 保持宽度不变 */
  height: 10.5vh; /* 保持高度不变 */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto; /* 居中对齐 */
  margin-right: auto; /* 居中对齐 */
}

.user-title {
  position: relative;
  width: 100%;
  height: 100%; /* 占满整个title-section */
  display: flex;
  align-items: center;
  justify-content: center; /* 居中显示 */
  border-radius: 8px;
}

.title-text {
  font-family: 'MFYuanHei', 'PingFang SC', sans-serif;
  font-size: 20vw; /* 大字体 */
  font-weight: bold;
  color: #5CBBF9; /* 设计稿中的蓝色 */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  /* 使用flex布局分散字符 */
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between; /* 字符之间均匀分布，首尾字符贴边 */
  align-items: center;
  
  /* 重置默认文字样式 */
  letter-spacing: 0; /* 重置字符间距，由flex控制 */
  line-height: 0.8; /* 减少行高以适应容器 */
  text-align: left; /* 重置文字对齐 */
}

.title-char {
  display: inline-block; /* 确保每个字符都是块级元素 */
  line-height: 0.8; /* 与父容器一致 */
  font-size: inherit; /* 继承父容器的字体大小 */
  color: inherit; /* 继承父容器的颜色 */
  text-shadow: inherit; /* 继承父容器的阴影 */
  flex-shrink: 0; /* 防止字符被压缩 */
}

/* 结果描述 */
.result-description {
  position: relative; /* 从absolute改为relative */
  margin-top: 1vh; /* 统一改为1vh间距 */
  left: 0; /* 移除left定位 */
  width: 89.07vw; /* 保持宽度不变 */
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600; /* 加粗字体 */
  font-size: 5.33vw; /* 20px at 375px width - 端内字体更大 */
  line-height: 1.4;
  color: #E7E7E7;
  /* 预估高度: 5.33vw * 1.4 * 2行 ≈ 14.9vw ≈ 5.6vh */
}

.score-line,
.distance-line {
  margin-bottom: 1.33vw; /* 5px at 375px width */
}

.number-text {
  font-family: 'RadikalW01Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: #5CBBF9; /* 设计稿中的蓝色 */
}

/* 排行榜标题 */
.leaderboard-title {
  position: relative; /* 从absolute改为relative */
  margin-top: 1vh; /* 统一改为1vh间距 */
  left: 0; /* 移除left定位 */
  display: flex;
  align-items: center;
  justify-content: center; /* 居中对齐 */
  gap: 2.13vw; /* 8px at 375px width */
  /* 预估高度: 约3vh */
}

.rank-icon {
  width: 3.47vw; /* 13px at 375px width */
  height: 3.47vw; /* 13px at 375px width */
}

.leaderboard-title .title-text {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 4vw; /* 15px at 375px width */
  line-height: 1.4;
  color: #FFFFFF;
}

/* 排行榜容器 */
.leaderboard-container {
  position: relative; /* 从absolute改为relative */
  margin-top: 1vh; /* 统一改为1vh间距 */
  left: 0; /* 移除left定位 */
  width: 89.6vw; /* 保持宽度不变 */
  height: 75vh; /* 从65vh增加到75vh，增加10vh可显示高度 */
  margin-left: auto; /* 居中对齐 */
  margin-right: auto; /* 居中对齐 */
}

/* 表头 */
.leaderboard-header {
  display: flex;
  align-items: center;
  height: 3.5vh; /* 调整为vh单位 */
  margin-bottom: 1vh; /* 调整为vh单位 */
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 3.2vw; /* 12px at 375px width */
  color: #606060;
}

.header-rank {
  width: 15.2vw; /* 57px at 375px width */
  text-align: center;
}

.header-name {
  width: 26.67vw; /* 100px at 375px width */
  text-align: left;
  padding-left: 5.33vw; /* 20px at 375px width */
}

.header-distance {
  width: 23.73vw; /* 89px at 375px width */
  text-align: center;
}

.header-score {
  width: 24vw; /* 90px at 375px width */
  text-align: center;
}

/* 可滚动的排行榜容器 */
.leaderboard-scroll-container {
  max-height: 45vh; /* 限制最大高度为视口高度的45% */
  overflow-y: auto; /* 启用垂直滚动 */
  /* 隐藏滚动条 - Firefox */
  scrollbar-width: none;
  /* 隐藏滚动条 - IE/Edge */
  -ms-overflow-style: none;
  /* 添加居中对齐 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 隐藏滚动条 - Webkit浏览器 */
.leaderboard-scroll-container::-webkit-scrollbar {
  display: none;
}

/* 我的成绩行 */
.my-result-row {
  position: relative;
  width: 89.6vw; /* 336px at 375px width */
  height: 5vh; /* 调整为vh单位 */
  margin-bottom: 1vh; /* 调整为vh单位 */
  /* 确保在flex容器中保持宽度 */
  flex-shrink: 0;
}

/* 排行榜行 */
.ranking-row {
  position: relative;
  width: 89.6vw; /* 336px at 375px width */
  height: 5vh; /* 调整为vh单位 */
  margin-bottom: 1vh; /* 调整为vh单位 */
  /* 确保在flex容器中保持宽度 */
  flex-shrink: 0;
}

.ranking-bg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 防止内容溢出 */
}

.ranking-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* 确保完整显示 */
}

.ranking-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 4vw; /* 15px at 375px width */
  z-index: 2;
}

.rank-number {
  width: 15.2vw; /* 57px at 375px width */
  text-align: center;
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: #0B0B0B;
}

.my-rank {
  color: #0B0B0B;
}

.player-name {
  width: 26.67vw; /* 100px at 375px width */
  text-align: left;
  padding-left: 5.33vw; /* 20px at 375px width */
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
  width: 23.73vw; /* 89px at 375px width */
  text-align: center;
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: #E7E7E7;
}

.my-distance {
  color: #E7E7E7;
}

.player-score {
  width: 24vw; /* 90px at 375px width */
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
  position: fixed; /* 改为固定定位 */
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15vh; /* 调整高度 */
  background: linear-gradient(180deg, transparent 0%, rgba(23, 23, 23, 0.9) 60%, rgba(23, 23, 23, 1) 100%);
  pointer-events: none;
  z-index: 1;
}

/* 分享提示 */
.share-tips {
  position: fixed; /* 改为固定定位 */
  bottom: 9vh; /* 相对于视窗底部定位 */
  left: 5.07vw; /* 19px at 375px width */
  width: 53.87vw; /* 202px at 375px width */
  height: 4.5vh; /* 调整高度 */
  z-index: 2; /* 确保分享提示在遮罩层之上 */
}

.tips-background {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 确保图片不被拉伸变形 */
  pointer-events: none; /* 不阻挡点击事件 */
}

/* 底部按钮 */
.bottom-buttons {
  position: fixed; /* 改为固定定位 */
  bottom: 3.5vh; /* 相对于视窗底部定位 */
  left: 5.33vw; /* 20px at 375px width */
  width: 89.6vw; /* 336px at 375px width */
  height: 5.5vh; /* 40px at 723px height */
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2; /* 确保按钮在遮罩层之上 */
}

.try-again-btn,
.share-btn {
  width: 42.67vw; /* 160px at 375px width */
  height: 5.5vh; /* 保持与底部按钮容器一致的高度 */
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  z-index: 2; /* 确保按钮可以点击 */
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