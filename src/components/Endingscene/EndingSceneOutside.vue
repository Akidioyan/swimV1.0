<template>
  <div class="ending-scene-outside">
    <!-- 背景容器 -->
    <div class="background-container">
      
      <!-- 恭喜文字 -->
      <div class="congratulation-text">
        恭喜{{ currentUserData?.nickName || '您' }}获得
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
            <span v-if="gameData.currentDistance > 100">{{ getRandomLoginText() }}</span>
            <span v-else-if="currentUserEntry?.rank === '未上榜'">{{ getRandomEncouragementText() }}</span>
            <span v-else>{{ getRandomLoginText() }}</span>
          </div>
          <!-- 删除以下distance-line部分 -->
          <!-- <div class="distance-line">
            你游了 <span class="number-text">{{ gameData.currentDistance }}</span> 米，
            已超越 <span class="number-text">{{ currentUserData?.rankPercent || '0' }}%</span> 网友！
          </div> -->
        </template>
      </div>

      <!-- openApp 大图 -->
      <div class="open-app-container">
        <img 
          src="/openApp.png" 
          @click="handleOpenApp" 
          class="open-app-image" 
          alt="打开APP解锁全部关卡"
        >
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
          <div v-if="currentUserEntry" class="my-result-row">
            <div class="ranking-bg-container">
              <img src="/vector/MeRankingList.svg" class="ranking-bg" alt="我的排名背景">
            </div>
            <div class="ranking-content">
              <span class="rank-number my-rank">{{ currentUserEntry.rank || '未上榜' }}</span>
              <span class="player-name my-name">我的成绩</span>
              <span class="player-distance my-distance">{{ currentUserEntry.distance || gameData.currentDistance }}</span>
              <span class="player-score my-score">{{ currentUserEntry.stars || gameData.stars }}</span>
            </div>
          </div>
          
          <!-- 扩展排行榜列表（50人） -->
          <div 
            v-for="(player, index) in extendedLeaderboard" 
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
      
      <!-- 分享提示（当需要时显示） -->
      <div v-if="showNeedShareTipsImage" class="share-tips">
        <img src="/needShareToPlayTips.png" alt="分享给好友，获得3次挑战机会" class="tips-background">
      </div>
      
      <!-- 底部按钮 -->
      <div class="bottom-buttons">
        <img 
          src="/tryAgain.png" 
          @click="handleRestartGame" 
          class="try-again-btn"
          alt="再次挑战"
        >
        <img 
          src="/shareToFriend.png" 
          @click="handleShareToFriendClick" 
          @touchstart="handleShareToFriendClick"
          @touchend.prevent
          class="share-friend-btn" 
          alt="分享给朋友"
        >
      </div>
    </div>

    <!-- 分享箭头遮罩 -->
    <div v-if="shareArrowOverlayIsVisible" class="share-overlay" @click="handleOverlayClick">
      <img src="/shareArrow.png" class="share-instruction-arrow" alt="点击此处分享">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { useGameStateStore } from '../../stores/gamestore/gameState'
import { useUserStore } from '../../stores/userStore'
import { openNativeScheme } from '../../utils/appDownload'
import { clickReport } from '../../utils/report'
import { getRankingBoard } from '../../utils/request'
import audioManager from '../../utils/audio-manager'

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const userStore = useUserStore()

const currentUserData = ref(null)
const shareArrowOverlayIsVisible = ref(false)
const leaderboardData = ref([])
const currentUserEntry = ref(null)
const showNeedShareTipsImage = ref(false)

// 分享相关状态
const shareActionInitiated = ref(false)
const shareTimestamp = ref(null)

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

// 未上榜提示词数组 - 根据游戏规则和游泳主题设计
const getRandomEncouragementText = () => {
  // 现在直接调用基于得分的文字函数
  return getScoreBasedText()
}

// 登录提示词数组 - 针对端外用户
const getRandomLoginText = () => {
  const loginTexts = [
    '登录腾讯新闻，进排行榜！',
    '登录解锁排行榜，看看你的实力！',
    '登录腾讯新闻，与全网高手竞技！',
    '登录获取官方排名，证明实力！',
    '登录腾讯新闻，挑战全国指尖达人！',
    '登录查看真实排行，展现指尖天赋！',
    '登录腾讯新闻，成为排行榜传奇！',
    '登录解锁更多功能，称霸游泳界！',
    '登录腾讯新闻，与千万玩家竞技！'
  ]
  
  return loginTexts[Math.floor(Math.random() * loginTexts.length)]
}

// 显示实际排行榜数据（不扩展虚拟数据）
const extendedLeaderboard = computed(() => {
  // 直接返回真实的API数据，不生成虚拟数据填充
  return leaderboardData.value
})

// 在script setup部分，修改数据处理逻辑

// 删除虚拟数据计算函数

// 修改onMounted函数中的数据处理逻辑（约第250-290行）
onMounted(async () => {
  // 添加页面可见性监听器
  document.addEventListener('visibilitychange', handleVisibilityChange)
  console.log('[EndingSceneOutside] 页面可见性监听器已添加')
  
  try {
    const currentDistance = gameData.value.currentDistance
    
    console.log(`[EndingSceneOutside] 当前距离: ${currentDistance}m`);
    
    // 获取真实排行榜数据
    console.log('[EndingSceneOutside] 开始获取真实排行榜数据...');
    try {
      const rankingResponse = await getRankingBoard();
      console.log('[EndingSceneOutside] 获取排行榜数据成功:', rankingResponse);
      
      if (rankingResponse && rankingResponse.data) {
        const apiData = rankingResponse.data;
        
        // 使用新公式计算击败百分比：less_score_count / ranking_size × 100%
        let defeatPercentage = 0;
        if (apiData.less_score_count && apiData.ranking_size) {
          defeatPercentage = Math.round((apiData.less_score_count / apiData.ranking_size) * 100);
          console.log(`[EndingSceneOutside] 击败百分比计算: ${apiData.less_score_count} / ${apiData.ranking_size} × 100% = ${defeatPercentage}%`);
        }
        
        // 设置用户数据 - 使用新公式计算的击败百分比
        currentUserData.value = { 
          rankPercent: defeatPercentage.toString(),
          nickName: '您'
        }
        
        // 解析排行榜数据
        if (apiData.ranking_board) {
          leaderboardData.value = apiData.ranking_board.map(entry => {
            return {
              rank: entry.ranking.rank,
              nick: (entry.user_info.nick && entry.user_info.nick.trim() !== '') ? entry.user_info.nick : "游泳挑战者",
              distance: entry.ranking.distance || 0,
              stars: entry.ranking.stars || 0,
              score: entry.ranking.stars || 0,
              head_url: entry.user_info.head_url || ''
            };
          });
          console.log('[EndingSceneOutside] 解析排行榜数据完成，共', leaderboardData.value.length, '条记录');
        }
      } else {
        console.warn('[EndingSceneOutside] 排行榜API返回数据格式异常，显示空状态');
        currentUserData.value = { rankPercent: '0', nickName: '您' }
        leaderboardData.value = [];
      }
    } catch (rankingError) {
      console.error('[EndingSceneOutside] 获取排行榜数据失败，显示空状态:', rankingError);
      currentUserData.value = { rankPercent: '0', nickName: '您' }
      leaderboardData.value = [];
    }
    
    // 设置当前用户数据 - 显示实际游戏成绩
    currentUserEntry.value = {
      rank: '未上榜', // 端外用户无法获取真实排名
      nick: "我",
      distance: currentDistance,
      stars: gameData.value.stars
    }
    
    console.log('[EndingSceneOutside] 数据准备完成 - 排行榜数据:', leaderboardData.value.length, '条');
  } catch (e) {
    console.error('[EndingSceneOutside] 初始化失败:', e);
    // 完全降级处理 - 显示空状态
    currentUserData.value = { rankPercent: '0', nickName: '您' }
    leaderboardData.value = []
    currentUserEntry.value = {
      rank: '未上榜',
      nick: "我",
      distance: gameData.value.currentDistance,
      stars: gameData.value.stars
    }
  }
})

// 添加onUnmounted清理函数
onUnmounted(() => {
  // 清理页面可见性监听器
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  console.log('[EndingSceneOutside] 页面可见性监听器已清理')
})

// 删除模拟排行榜数据生成函数

const handleRestartGame = () => {
  // 播放按钮音效
  audioManager.playSoundEffect('button')
  
  // 删除次数统计日志
  // userStore.logCurrentPlayStats('[EndingSceneOutside] handleRestartGame clicked')
  
  // 检查端内APP用户是否已登录
  if (userStore.isInQQNewsApp && !userStore.hasLogin) {
    console.log('🚫 端内APP用户未登录，无法重新开始游戏');
    
    // 上报点击事件
    clickReport({
      id: 'restart_game_login_required',
    });
    
    return; // 阻止重新开始游戏
  }
  
  // 删除剩余游戏次数检查
  // if (!userStore.canPlay) {
  //   return
  // }
  
  console.log('✅ 用户验证通过，重新开始游戏');
  
  // 上报重新开始游戏事件
  clickReport({
    id: 'restart_game',
  });
  
  gameStateStore.restartGame()
}

const handleOpenApp = () => {
  // 播放按钮音效
  audioManager.playSoundEffect('button')
  
  clickReport({
    id: 'open_app',
  })
  openNativeScheme('qqnews://article_9527?nm=LNK2025072504936600', 'swimming')
}


// 分享按钮点击处理
const handleShareToFriendClick = () => {
  // 播放按钮音效
  audioManager.playSoundEffect('button')
  
  console.log('[EndingSceneOutside] handleShareToFriendClick called! 分享按钮被点击了');
  
  try {
    clickReport({ id: 'share_in_outside' })
    console.log('[EndingSceneOutside] clickReport called successfully');
  } catch (error) {
    console.error('[EndingSceneOutside] clickReport error:', error);
  }
  
  // 记录分享操作开始，显示分享箭头遮罩
  shareActionInitiated.value = true
  shareTimestamp.value = Date.now()
  shareArrowOverlayIsVisible.value = true
  console.log('[EndingSceneOutside] shareArrowOverlayIsVisible set to true');
}

const handleOverlayClick = () => {
  // 播放按钮音效
  audioManager.playSoundEffect('button')
  
  console.log('[EndingSceneOutside] shareArrowOverlay clicked, closing overlay')
  shareArrowOverlayIsVisible.value = false
  
  // 重置分享状态
  if (shareActionInitiated.value) {
    console.log('[EndingSceneOutside] 分享完成，重置分享状态')
    shareActionInitiated.value = false
  }
}

// 删除不再需要的函数
// const handleOverlayClick = () => {
//   console.log('[EndingSceneOutside] shareArrowOverlay clicked, closing overlay and granting bonus plays')
//   // shareArrowOverlayIsVisible.value = false
//   
//   // 用户点击关闭分享遮罩时立即授予奖励次数
//   // if (shareActionInitiated.value) {
//   //   const granted = userStore.grantBonusPlays(3)
//   //   if (granted) {
//   //     console.log('[EndingSceneOutside] 分享完成！奖励次数授予成功')
//   //     shareActionInitiated.value = false
//   //     userStore.logCurrentPlayStats('[EndingSceneOutside] After manual granting bonus plays')
             
//   //     // 强制UI更新 - 确保按钮状态立即更新
//   //     nextTick(() => {
//   //       console.log('[EndingSceneOutside] UI更新完成，当前canPlay状态:', userStore.canPlay)
//   //       // 强制触发响应式更新
//   //       isTryAgainDisabled.value = !userStore.canPlay
//   //       showNeedShareTipsImage.value = !userStore.canPlay
//   //     })
//   //   } else {
//   //     console.log('[EndingSceneOutside] 今日已授予过奖励次数')
//   //     shareActionInitiated.value = false
//   //   }
//   // }
// }

// 页面可见性变化监听 - 用户从分享返回时的处理
const handleVisibilityChange = () => {
  if (!document.hidden && shareActionInitiated.value) {
    // 页面重新可见且有分享操作进行中
    const timeSinceShare = Date.now() - (shareTimestamp.value || 0)
    console.log(`[EndingSceneOutside] 页面重新可见，分享操作距今 ${timeSinceShare}ms`)
    
    if (timeSinceShare > 1000) { // 如果分享操作超过1秒，认为用户完成了分享
      setTimeout(() => {
        if (shareActionInitiated.value) {
          console.log('[EndingSceneOutside] 检测到从分享返回，重置分享状态')
          shareActionInitiated.value = false
          shareArrowOverlayIsVisible.value = false
        }
      }, 500) // 稍微延迟一下确保状态稳定
    }
  }
}
</script>

<style scoped>
/* 导入字体 */
@import url('https://fonts.googleapis.com/css2?family=PingFang+SC:wght@300;400;600&display=swap');

.ending-scene-outside {
  width: 100%;
  height: 100vh;
  background-color: rgb(127, 228, 255); /* 设计稿背景色：天蓝色 */
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .ending-scene-outside {
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
  padding-bottom: 25vh;
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
  color: rgb(37, 96, 112); /* 设计稿文字色：深蓝绿色 */
  /* 预估高度: 4vw * 1.4 ≈ 5.6vw ≈ 2.1vh */
}

/* 称号区域 */
.title-section {
  position: relative; /* 从absolute改为relative */
  margin-top: 1vh; /* 统一改为1vh间距 */
  left: 0; /* 移除left定位 */
  width: 89.6vw; /* 保持宽度不变 */
  height: 11vh; /* 保持高度不变 */
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
  /* 移除背景色和背景渐变 */
  border-radius: 8px;
  -webkit-text-stroke: 0.7px #72332E; /* 添加0.7px描边 */
}

.title-text {
  font-family: 'MFYuanHei', 'PingFang SC', sans-serif;
  font-size: 22vw; /* 放大文字 */
  font-weight: bold;
  color: rgb(255, 121, 121); /* 设计稿称号色：橙红色 */
  
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
  display: inline-block;
  line-height: 0.8;
  font-size: 22vw !important; /* 强制设置固定字体大小 */
  color: rgb(255, 121, 121); /* 设计稿称号色：橙红色 */
  -webkit-text-stroke: inherit; /* 继承父元素的描边样式 */
  flex-shrink: 0;
  font-family: 'MFYuanHei', 'PingFang SC', sans-serif;
  font-weight: bold;
}

/* 结果描述 */
.result-description {
  position: relative; /* 从absolute改为relative */
  margin-top: 1vh; /* 统一改为1vh间距 */
  left: 0; /* 移除left定位 */
  width: 89.07vw; /* 保持宽度不变 */
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600; /* 加粗字体 */
  font-size: 4.5vw; /* 加大字号 */
  line-height: 1.4;
  color: rgb(37, 96, 112); /* 设计稿文字色：深蓝绿色 */
  /* 预估高度: 4.5vw * 1.4 * 2行 ≈ 12.6vw ≈ 4.7vh */
}

.score-line,
.distance-line {
  margin-bottom: 1.33vw; /* 5px at 375px width */
}

.number-text {
  font-family: 'RadikalW01Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: rgb(255, 121, 121); /* 设计稿强调色：橙红色 */
}

.open-app-container {
  position: relative; /* 从absolute改为relative */
  margin-top: 1vh; /* 统一改为1vh间距 */
  left: 0; /* 移除left定位 */
  width: 89.6vw; /* 保持宽度不变 */
  aspect-ratio: 21 / 17; /* 保持比例不变 */
  margin-left: auto; /* 居中对齐 */
  margin-right: auto; /* 居中对齐 */
  /* 计算高度: 89.6vw * (17/21) ≈ 72.5vw ≈ 27.2vh */
}

.open-app-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.open-app-image:hover {
  transform: scale(1.02);
}

/* 排行榜标题 */
.leaderboard-title {
  position: relative; /* 从absolute改为relative */
  margin-top: 1vh; /* 统一改为1vh间距 */
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 改为靠左对齐 */
  gap: 2.13vw; /* 8px at 375px width */
  /* 预估高度: 约3vh */
}

.rank-icon {
  width: 3.47vw; /* 13px at 375px width */
  height: 3.47vw; /* 13px at 375px width */
}

.leaderboard-title .leaderboard-title-text {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 4vw; /* 15px at 375px width */
  line-height: 1.4;
  color: rgb(37, 96, 112); /* 设计稿文字色：深蓝绿色 */
}

/* 排行榜容器 */
.leaderboard-container {
  position: relative; /* 从absolute改为relative */
  margin-top: 1vh; /* 统一改为1vh间距 */
  left: 0; /* 移除left定位 */
  width: 89.6vw; /* 保持宽度不变 */
  height: 45vh; /* 从35vh增加到45vh，增加10vh可显示高度 */
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
  color: rgb(37, 96, 112); /* 设计稿表头色：深蓝绿色 */
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
  max-height: 55vh; /* 限制最大高度为视口高度的45% */
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
  object-fit: contain; /* 改为contain确保完整显示 */
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
  color: rgb(11, 11, 11); /* 设计稿排名数字色：深色 */
}

.my-rank {
  color: rgb(255, 253, 223); /* 设计稿我的成绩文字色：淡黄色 */
}

.player-name {
  width: 26.67vw; /* 100px at 375px width */
  text-align: left;
  padding-left: 5.33vw; /* 20px at 375px width */
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
  width: 23.73vw; /* 89px at 375px width */
  text-align: center;
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: rgb(11, 11, 11); /* 设计稿一般行文字色：深色 */
}

.my-distance {
  color: rgb(255, 253, 223); /* 设计稿我的成绩文字色：淡黄色 */
}

.player-score {
  width: 24vw; /* 90px at 375px width */
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
  position: fixed; /* 改为固定定位 */
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15vh; /* 调整高度 */
  background: linear-gradient(180deg, transparent 0%, rgba(127, 228, 255, 0.9) 60%, rgba(127, 228, 255, 1) 100%); /* 使用设计稿背景色渐变 */
  pointer-events: none;
  z-index: 1;
}

/* 分享提示 */
.share-tips {
  position: fixed; /* 改为固定定位 */
  bottom: 15vh; /* 从9vh调整为15vh，确保在按钮上方 */
  left: 5.07vw; /* 19px at 375px width */
  width: 53.87vw; /* 202px at 375px width */
  height: 4.5vh; /* 调整高度 */
  z-index: 3; /* 提高z-index确保在按钮之上 */
}

.tips-background {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 确保图片内容完整显示 */
}

/* 底部按钮 */
.bottom-buttons {
  position: fixed; /* 改为固定定位 */
  bottom: 3.5vh; /* 相对于视窗底部定位 */
  left: 5.33vw; /* 20px at 375px width */
  width: 89.6vw; /* 336px at 375px width */
  height: auto; /* 改为auto，让按钮保持原始比例 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2; /* 确保按钮在遮罩层之上 */
}

.try-again-btn,
.share-friend-btn {
  width: 42.67vw; /* 160px at 375px width */
  height: auto; /* 删除固定高度，保持图片原始纵横比 */
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  z-index: 2; /* 确保按钮可以点击 */
  object-fit: contain; /* 确保图片内容完整显示 */
}

.try-again-btn:hover,
.share-friend-btn:hover {
  transform: scale(1.05);
}

/* 删除按钮禁用状态的样式 */
/* .try-again-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.try-again-btn.disabled:hover {
  transform: none;
} */

/* 底部按钮遮罩 */
.bottom-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 9.26vh; /* 67px at 723px height - 覆盖按钮区域 */
  background: rgba(127, 228, 255, 0.95); /* 使用设计稿背景色 */
  z-index: 0;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .bottom-overlay {
    height: 9.26dvh; /* 67px at 723px height - 覆盖按钮区域 */
  }
}

/* 分享箭头遮罩 */
.share-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.share-instruction-arrow {
  position: fixed;
  top: 2.76vh;
  right: 5.33vw;
  width: 26.67vw;
  height: auto;
  z-index: 11;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .share-overlay {
    width: 100dvw;
    height: 100dvh;
  }
  
  .share-instruction-arrow {
    top: 2.76dvh;
  }
}
</style>