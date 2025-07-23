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
            <span v-if="currentUserEntry?.rank > 50">很遗憾没有进入排行榜。</span>
            <span v-else>排名第 <span class="number-text">{{ currentUserEntry?.rank || '未上榜' }}</span> 名！</span>
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
        
        <!-- 如果已使用过分享加命机会，显示第二个再挑战按钮 -->
        <button 
          v-if="hasUsedReviveChance"
          @click="handleShareWithoutRevive" 
          class="try-again-btn"
        >
          <img src="/tryAgain.png" alt="分享给朋友" class="btn-image">
        </button>
        
        <!-- 如果未使用过分享加命机会，显示分享加命按钮 -->
        <button 
          v-else
          @click="handleShareInApp" 
          class="share-add-live-btn"
        >
          <img src="/OneMore.png" alt="分享加命" class="btn-image">
        </button>
      </div>
    </div>
    
    <!-- 冲击排行榜弹窗 -->
    <div v-if="showLeaderboardChallenge" class="leaderboard-challenge-modal" @click.self="closeLeaderboardChallenge">
      <div class="challenge-content" @click="continueGame">
        <img src="/ContinueToChallenge.png" alt="继续挑战" class="challenge-bg-image">
        <div class="challenge-overlay">
          <!-- 用户数据叠加在设计稿的指定位置 -->
          <div class="user-rank-data">{{ savedGameState.rank !== '未上榜' ? savedGameState.rank : '-' }}</div>
          <div class="user-distance-data">{{ savedGameState.distance }}米</div>
          <div class="user-score-data">{{ savedGameState.score }}分</div>
        </div>
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
import { reportSwimmingGameResult } from '../../utils/request';
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

// 分享加命相关状态
const showLeaderboardChallenge = ref(false);
const savedGameState = ref({
  distance: 0,
  score: 0,
  lives: 0,
  stars: 0
});
const hasPendingRevive = ref(false); // 是否有待复活的状态
const hasUsedReviveChance = ref(false); // 是否已使用过分享加命机会
let focusListenerCleanup = null; // 焦点事件监听器清理函数

// 游戏数据
const gameData = computed(() => ({
  currentDistance: gameStateStore.finalDistance || gameStore.distance || 0,
  stars: gameStateStore.score || gameStore.stars || 0
}))

// 根据距离获取称号
const getTitleByDistance = (distance) => {
  if (distance >= 1000) return '千米冠军'
  if (distance >= 600) return '游泳健将'
  if (distance >= 300) return '中流砥柱'
  if (distance >= 100) return '百米泳者'
  return '初出茅庐'
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
  
  // 检查是否有待复活的状态（用户可能从分享返回）
  const pendingReviveState = localStorage.getItem('pendingReviveState');
  if (pendingReviveState && userStore.isInQQNewsApp) {
    try {
      const reviveData = JSON.parse(pendingReviveState);
      // 确保数据完整性，补充可能缺失的字段
      savedGameState.value = {
        distance: reviveData.distance || 0,
        score: reviveData.score || 0,
        lives: reviveData.lives || 2,
        stars: reviveData.stars || 0,
        rank: reviveData.rank || '未上榜',
        rankPercent: reviveData.rankPercent || '0'
      };
      hasPendingRevive.value = true;
      
      // 延迟显示弹窗，确保组件完全加载
      setTimeout(() => {
        showLeaderboardChallenge.value = true;
      }, 800); // 增加到800ms确保页面完全渲染
      
      // 清除localStorage中的数据
      localStorage.removeItem('pendingReviveState');
      console.log('[EndingSceneApp] Restored pending revival state:', savedGameState.value);
    } catch (error) {
      console.warn('[EndingSceneApp] Failed to parse pending revive state:', error);
      localStorage.removeItem('pendingReviveState');
    }
  }

  console.log('[EndingSceneApp] Attempting to fetch swimming game leaderboard data...');
  isLoadingApi.value = true;
  apiError.value = null;
  try {
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

    if (realDataResponse && realDataResponse.data) {
      const apiData = realDataResponse.data;

      // 设置当前用户数据
      currentUserEntry.value = {
        rank: apiData.currentUserEntry?.rank || Math.floor(Math.random() * 100) + 50,
        nick: displayNick.value,
        distance: gameData.value.currentDistance,
        stars: gameData.value.stars
      };

      // 设置排行榜数据
      if (apiData.leaderboardEntries && Array.isArray(apiData.leaderboardEntries)) {
        leaderboardData.value = apiData.leaderboardEntries.map(player => ({
          rank: player.rank,
          nick: (player.nick && player.nick.trim() !== '') ? player.nick : "游泳挑战者",
          distance: player.distance,
          stars: player.stars || player.score || 0,
        }));
      } else {
        console.warn('[EndingSceneApp] API response missing or invalid leaderboardEntries');
        leaderboardData.value = generateMockLeaderboard();
      }
      
      currentUserData.value = { rankPercent: apiData.rankPercent?.replace('%', '') || '50' };
      
      console.log('[EndingSceneApp] Parsed currentUserEntry:', currentUserEntry.value);
      console.log('[EndingSceneApp] Parsed leaderboardData:', leaderboardData.value);
    } else {
      console.error('[EndingSceneApp] API response error or malformed data:', realDataResponse);
      apiError.value = realDataResponse?.msg || 'API request failed or returned malformed data';
      // 使用模拟数据
      leaderboardData.value = generateMockLeaderboard();
      currentUserEntry.value = {
        rank: Math.floor(Math.random() * 100) + 50,
        nick: displayNick.value,
        distance: gameData.value.currentDistance,
        stars: gameData.value.stars
      };
      currentUserData.value = { rankPercent: '66' };
    }
  } catch (error) {
    console.error('[EndingSceneApp] Error fetching swimming game leaderboard data:', error);
    apiError.value = error.message || 'Failed to fetch data';
    // 使用模拟数据作为降级方案
    leaderboardData.value = generateMockLeaderboard();
    currentUserEntry.value = {
      rank: Math.floor(Math.random() * 100) + 50,
      nick: displayNick.value,
      distance: gameData.value.currentDistance,
      stars: gameData.value.stars
    };
    currentUserData.value = { rankPercent: '33' };
  } finally {
    isLoadingApi.value = false;
  }
});

// 生成模拟排行榜数据
function generateMockLeaderboard() {
  const mockData = []
  const nicknames = ['游泳健将', '水中飞鱼', '蛙泳大师', '自由泳王', '仰泳高手', '蝶泳专家', '水上飞人', '游泳达人']
  
  for (let i = 1; i <= 50; i++) {
    const stars = Math.max(1, 50 - i + Math.floor(Math.random() * 10))
    const distance = Math.max(100, 1000 - i * 20 + Math.floor(Math.random() * 100))
    
    mockData.push({
      rank: i,
      nick: `${nicknames[Math.floor(Math.random() * nicknames.length)]}_${Math.floor(Math.random() * 1000)}`,
      distance: distance,
      stars: stars,
      score: stars
    })
  }
  
  return mockData
}

const handleRestartGame = () => {
  userStore.logCurrentPlayStats('[EndingSceneApp] handleRestartGame clicked');
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
  
  // 重置分享加命机会状态，每次新游戏都有一次机会
  hasUsedReviveChance.value = false;
  console.log('[EndingSceneApp] Restarting game, hasUsedReviveChance reset to false');
  
  // 使用gameStateStore的重启方法
  gameStateStore.restartGame()
}

const handleShareInApp = () => {
  userStore.logCurrentPlayStats('[EndingSceneApp] handleShareInApp clicked');
  console.log('[EndingSceneApp] Initiating share for extra life...');
  
  // 检查是否在端内APP环境
  if (!userStore.isInQQNewsApp) {
    console.warn('[EndingSceneApp] Revival feature only available in QQ News App');
    return;
  }
  
  clickReport({
    id: 'share_for_life',
  })

  // 保存当前游戏状态
  savedGameState.value = {
    distance: gameData.value.currentDistance,
    score: gameData.value.stars,
    lives: gameStateStore.lives || 2, // 当前生命数（死亡前）
    stars: gameData.value.stars,
    rank: currentUserEntry.value?.rank || '未上榜',
    rankPercent: currentUserData.value?.rankPercent || '0'
  };
  
  // 将复活状态保存到localStorage，防止用户分享后返回时丢失状态
  localStorage.setItem('pendingReviveState', JSON.stringify(savedGameState.value));
  
  hasPendingRevive.value = true;
  console.log('[EndingSceneApp] Game state saved for revival:', savedGameState.value);

  const distance = gameData.value.currentDistance;
  const rankPercent = currentUserData.value?.rankPercent || 0;
  let shareContent = '';

  if (distance === 0) {
    shareContent = '用指尖与全网游泳高手对决，一起来游泳挑战！';
  } else {
    shareContent = '我在指尖游泳中游了' + distance + 'm，挑战失败了！分享助我复活，继续冲击排行榜！';
  }

  setShareInfo({
    title: '指尖游泳挑战赛_腾讯新闻',
    longTitle: shareContent,
    content: shareContent,
    url: 'https://view.inews.qq.com/a/LNK2025052211684300?no-redirect=1',
    imgUrl: 'https://mat1.gtimg.com/rain/apub2019/42bd7e299fc4.shareimg.png', 
  });

  // 监听分享完成事件
  console.log('[EndingSceneApp] Share menu shown. Waiting for share completion...');
  
  // 设置分享完成监听
  const handleShareComplete = () => {
    console.log('[EndingSceneApp] Share completed. Showing leaderboard challenge modal.');
    if (hasPendingRevive.value) {
      showLeaderboardChallenge.value = true;
    }
  };

  // 由于腾讯新闻JSAPI可能没有直接的完成回调，我们监听页面的focus事件
  // 当用户从分享页面返回时触发
  const handlePageFocus = () => {
    setTimeout(() => {
      if (hasPendingRevive.value && !showLeaderboardChallenge.value) {
        console.log('[EndingSceneApp] User returned from share, showing revival modal.');
        showLeaderboardChallenge.value = true;
      }
    }, 500); // 延迟500ms确保页面完全聚焦
  };

  // 添加页面焦点事件监听
  window.addEventListener('focus', handlePageFocus);
  
  // 创建清理函数
  focusListenerCleanup = () => {
    window.removeEventListener('focus', handlePageFocus);
  };
  
  // 5秒后清理监听器，避免长期监听
  setTimeout(() => {
    if (focusListenerCleanup) {
      focusListenerCleanup();
      focusListenerCleanup = null;
    }
  }, 5000);
  
  showShareMenu();
}

// 分享但不复活（已使用过加命机会后的分享）
const handleShareWithoutRevive = () => {
  userStore.logCurrentPlayStats('[EndingSceneApp] handleShareWithoutRevive clicked');
  console.log('[EndingSceneApp] Initiating share without revival...');
  
  clickReport({
    id: 'share_without_revive',
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
  console.log('[EndingSceneApp] Share completed without revival.');
}

// 继续游戏（复活）
const continueGame = () => {
  console.log('[EndingSceneApp] Player chose to continue game with extra life');
  
  // 恢复游戏状态并加一条命
  gameStateStore.lives = savedGameState.value.lives + 1;
  gameStateStore.distance = savedGameState.value.distance;
  gameStateStore.score = savedGameState.value.score;
  gameStateStore.stars = savedGameState.value.stars;
  
  // 重置游戏状态为playing
  gameStateStore.gameState = 'playing';
  gameStateStore.currentView = 'game';
  
  // 标记已使用过分享加命机会
  hasUsedReviveChance.value = true;
  
  // 清理复活状态和localStorage
  hasPendingRevive.value = false;
  showLeaderboardChallenge.value = false;
  localStorage.removeItem('pendingReviveState');
  
  // 清理事件监听器
  if (focusListenerCleanup) {
    focusListenerCleanup();
    focusListenerCleanup = null;
  }
  
  console.log('[EndingSceneApp] Game resumed with extra life. Lives:', gameStateStore.lives);
  console.log('[EndingSceneApp] Revive chance used, hasUsedReviveChance set to true');
}

// 放弃挑战
const giveUpChallenge = () => {
  console.log('[EndingSceneApp] Player chose to give up challenge');
  
  // 清理复活状态和localStorage
  hasPendingRevive.value = false;
  showLeaderboardChallenge.value = false;
  localStorage.removeItem('pendingReviveState');
  
  // 清理事件监听器
  if (focusListenerCleanup) {
    focusListenerCleanup();
    focusListenerCleanup = null;
  }
  
  // 重置分享加命机会状态，重新开始游戏时获得新机会
  hasUsedReviveChance.value = false;
  console.log('[EndingSceneApp] Giving up challenge, hasUsedReviveChance reset to false');
  
  // 重新开始游戏
  gameStateStore.restartGame();
}

// 关闭冲击排行榜弹窗
const closeLeaderboardChallenge = () => {
  // 点击背景关闭时相当于放弃挑战
  giveUpChallenge();
}
</script>

<style scoped>
/* 导入字体 */
@import url('https://fonts.googleapis.com/css2?family=PingFang+SC:wght@300;400;600&display=swap');

.ending-scene-app {
  width: 100%;
  height: 100dvh;
  background-color: #171717;
  position: relative;
  overflow: hidden;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
}

.background-container {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0 5.33vw; /* 20px at 375px width */
  box-sizing: border-box;
}

/* 恭喜文字 */
.congratulation-text {
  position: absolute;
  top: 4.15dvh; /* 30px at 723px height */
  left: 5.33vw; /* 20px at 375px width */
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 4vw; /* 15px at 375px width */
  line-height: 1.4;
  color: #E7E7E7;
}

/* 称号区域 */
.title-section {
  position: absolute;
  top: 8.15dvh; /* 59px at 723px height - 端内布局稍微紧凑 */
  left: 5.33vw; /* 与其他元素对齐 */
  width: 89.6vw; /* 与其他元素宽度一致 */
  height: 10.65dvh; /* 77px at 723px height */
  display: flex;
  align-items: center;
  justify-content: center;
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
  position: absolute;
  top: 19.64dvh; /* 142px at 723px height */
  left: 5.33vw; /* 20px at 375px width */
  width: 89.07vw; /* 334px at 375px width */
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600; /* 加粗字体 */
  font-size: 5.33vw; /* 20px at 375px width - 端内字体更大 */
  line-height: 1.4;
  color: #E7E7E7;
}

.score-line,
.distance-line {
  margin-bottom: 1.33vw; /* 5px at 375px width */
}

.number-text {
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: #5CBBF9; /* 设计稿中的蓝色 */
}

/* 排行榜标题 */
.leaderboard-title {
  position: absolute;
  top: 27.66dvh; /* 200px at 723px height */
  left: 5.33vw; /* 20px at 375px width */
  display: flex;
  align-items: center;
  gap: 2.13vw; /* 8px at 375px width */
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
  position: absolute;
  top: 31.39dvh; /* 227px at 723px height */
  left: 5.33vw; /* 20px at 375px width */
  width: 89.6vw; /* 336px at 375px width */
  height: 61.41dvh; /* 444px at 723px height - 更大的排行榜空间 */
}

/* 表头 */
.leaderboard-header {
  display: flex;
  align-items: center;
  height: 3.32dvh; /* 24px at 723px height */
  margin-bottom: 1.11dvh; /* 8px at 723px height */
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
  height: 56.98dvh; /* 412px at 723px height */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.leaderboard-scroll-container::-webkit-scrollbar {
  width: 0;
  background: transparent; /* Chrome/Safari/Webkit */
}

/* 我的成绩行 */
.my-result-row {
  position: relative;
  width: 89.6vw; /* 336px at 375px width */
  height: 4.7dvh; /* 34px at 723px height */
  margin-bottom: 1.11dvh; /* 8px at 723px height */
}

/* 排行榜行 */
.ranking-row {
  position: relative;
  width: 89.6vw; /* 336px at 375px width */
  height: 4.7dvh; /* 34px at 723px height */
  margin-bottom: 1.11dvh; /* 8px at 723px height */
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
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 14.94dvh; /* 108px at 723px height */
  background: linear-gradient(180deg, transparent 0%, rgba(23, 23, 23, 0.9) 60%, rgba(23, 23, 23, 1) 100%);
  pointer-events: none;
  z-index: 1;
}

/* 分享提示 */
.share-tips {
  position: absolute;
  bottom: 13.69dvh; /* 99px at 723px height */
  left: 5.07vw; /* 19px at 375px width */
  width: 53.87vw; /* 202px at 375px width */
  height: 4.56dvh; /* 33px at 723px height */
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
  position: absolute;
  bottom: 8.91dvh; /* 644px from top = 79px from bottom at 723px height */
  left: 5.33vw; /* 20px at 375px width */
  width: 89.6vw; /* 336px at 375px width */
  height: 5.53dvh; /* 40px at 723px height */
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2; /* 确保按钮在遮罩层之上 */
}

.try-again-btn,
.share-add-live-btn {
  width: 42.67vw; /* 160px at 375px width */
  height: 5.53dvh; /* 40px at 723px height */
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
.share-add-live-btn:hover {
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

/* 冲击排行榜弹窗 */
.leaderboard-challenge-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.challenge-content {
  background: transparent; /* 移除背景，使用图片 */
  border: none; /* 移除边框 */
  border-radius: 0; /* 移除圆角 */
  padding: 0; /* 移除内边距 */
  width: 85vw; /* 320px at 375px width - 稍微增大 */
  max-width: 90vw;
  text-align: center;
  box-shadow: none; /* 移除阴影 */
  animation: modalSlideIn 0.3s ease-out;
  position: relative;
  cursor: pointer; /* 添加指针样式表示可点击 */
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.challenge-bg-image {
  width: 100%;
  height: auto; /* 保持图片比例 */
  object-fit: contain;
  display: block;
  pointer-events: none; /* 防止图片阻止点击事件 */
}

.challenge-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 数据层不阻止点击事件 */
}

/* 根据设计稿定位用户数据 */
.user-rank-data {
  position: absolute;
  bottom: 13.5%; /* 调整到设计稿中"我的排名"文字下方 */
  left: 15%; /* 左侧排名区域 */
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-size: 4.8vw; /* 18px at 375px width */
  font-weight: bold;
  color: #5CBBF9;
  text-align: center;
}

.user-distance-data {
  position: absolute;
  bottom: 13.5%; /* 与排名对齐 */
  left: 50%; /* 中间距离区域 */
  transform: translateX(-50%); /* 居中对齐 */
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-size: 4.8vw; /* 18px at 375px width */
  font-weight: bold;
  color: #5CBBF9;
  text-align: center;
}

.user-score-data {
  position: absolute;
  bottom: 13.5%; /* 与其他数据对齐 */
  right: 15%; /* 右侧得分区域 */
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-size: 4.8vw; /* 18px at 375px width */
  font-weight: bold;
  color: #5CBBF9;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 414px) {
  .background-container {
    padding: 0 4.27vw; /* 16px at 375px equivalent */
  }
  
  .title-section {
    left: 4.27vw;
    width: calc(100% - 8.54vw);
  }
  
  .leaderboard-container {
    left: 4.27vw;
    width: calc(100% - 8.54vw);
  }
  
  .title-text {
    font-size: 18vw; /* 稍微小一点 */
  }
}

@media (max-width: 375px) {
  .title-text {
    font-size: 16vw; /* 更小的屏幕 */
  }
  
  .result-description {
    font-size: 4.8vw; /* 18px equivalent */
  }
}
</style>