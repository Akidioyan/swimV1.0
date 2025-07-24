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
          <div class="distance-line">
            你游了 <span class="number-text">{{ gameData.currentDistance }}</span> 米，
            已超越 <span class="number-text">{{ currentUserData?.rankPercent || '0' }}%</span> 网友！
          </div>
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
      
      <!-- 分享提示（当无法继续游戏时显示） -->
      <div v-if="showNeedShareTipsImage" class="share-tips">
        <img src="/needShareToPlayTips.png" alt="分享给好友，获得3次挑战机会" class="tips-background">
      </div>
      
      <!-- 底部按钮 -->
      <div class="bottom-buttons">
        <img 
          src="/tryAgain.png" 
          @click="handleRestartGame" 
          class="try-again-btn" 
          :class="{ 'disabled': isTryAgainDisabled }" 
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
import { ref, watch, onMounted, computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { useGameStateStore } from '../../stores/gamestore/gameState'
import { useUserStore } from '../../stores/userStore'
import { openNativeScheme } from '../../utils/appDownload'
import { clickReport } from '../../utils/report'

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const userStore = useUserStore()

const currentUserData = ref(null)
const shareArrowOverlayIsVisible = ref(false)
const leaderboardData = ref([])
const currentUserEntry = ref(null)
const showNeedShareTipsImage = ref(false)
const isTryAgainDisabled = ref(false)

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

// 未上榜提示词数组 - 根据游戏规则和游泳主题设计
const getRandomEncouragementText = () => {
  const encouragementTexts = [
    '继续挑战，冲击排行榜！',
    '再接再厉，向高分进发！',
    '加油，突破极限！',
    '勇敢前行，下次必上榜！',
    '练好技巧，排行榜等你！',
    '收集更多星星，冲击高分！',
    '掌握节奏，再创佳绩！',
    '继续训练，成为达人！',
    '排行榜在向你招手！',
    '提升技能，下回称王！',
    '点左屏左移，点右屏右移！',
    '星星是关键，多收集冲高分！',
    '坚持，总有上榜的一天！',
    '挑战极限，超越更多网友！',
    '高手就是你，再来一局！',
    '水中冲浪，再创奇迹！',
    '样样精通才能上榜！',
    '姿势很重要，练好再来！',
    '呼吸管是神器，不怕障碍就是冲！',
    '游出风采，游出精彩人生！',
    '水花四溅，梦想在前方等你！',
    '每一次划水都是进步的开始！',
    '世上无捷径，只有肯攀登！',
    '乘风破浪，游向更远！'
  ]
  
  return encouragementTexts[Math.floor(Math.random() * encouragementTexts.length)]
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
    '登录腾讯新闻，与千万玩家同台竞技！'
  ]
  
  return loginTexts[Math.floor(Math.random() * loginTexts.length)]
}

// 扩展排行榜数据（50人）
const extendedLeaderboard = computed(() => {
  const extended = [...leaderboardData.value]
  
  // 如果不足50人，生成更多数据
  while (extended.length < 50) {
    const rank = extended.length + 1
    const nicknames = ['游泳健将', '水中飞鱼', '蛙泳大师', '自由泳选手', '仰泳高手', '蝶泳专家', '混合泳王者', '水中精灵']
    const baseStar = Math.max(1, 30 - rank + Math.floor(Math.random() * 5))
    const baseDistance = Math.max(50, 800 - rank * 10 + Math.floor(Math.random() * 50))
    
    extended.push({
      rank: rank,
      nick: `${nicknames[Math.floor(Math.random() * nicknames.length)]}_${Math.floor(Math.random() * 1000)}`,
      distance: baseDistance,
      stars: baseStar,
      score: baseStar
    })
  }
  
  return extended.slice(0, 50)
})

// 监听游戏次数变化
watch(() => userStore.canPlay, (canStillPlay) => {
  console.log(`[EndingSceneOutside] userStore.canPlay changed to: ${canStillPlay}`)
  isTryAgainDisabled.value = !canStillPlay
  showNeedShareTipsImage.value = !canStillPlay
  userStore.logCurrentPlayStats('[EndingSceneOutside] Stats after canPlay changed')
}, { immediate: true })

// 在script setup部分，修改数据处理逻辑

// 计算击败百分比的函数（端外使用假数据）
const calculateDefeatPercentage = (distance) => {
  // 基于距离推算排名和战胜百分比，更符合逻辑
  if (distance >= 300) {
    // 超长距离：排名很靠前，战胜90-99%
    return Math.min(90 + Math.floor((distance - 300) / 10), 99);
  } else if (distance >= 200) {
    // 长距离：排名中上，战胜70-89%
    return 70 + Math.floor((distance - 200) / 5);
  } else if (distance >= 100) {
    // 中等距离：排名中等，战胜40-69%
    return 40 + Math.floor((distance - 100) / 3.33);
  } else if (distance >= 50) {
    // 短距离：排名中下，战胜20-39%
    return 20 + Math.floor((distance - 50) / 2.5);
  } else if (distance >= 20) {
    // 很短距离：排名较低，战胜5-19%
    return 5 + Math.floor((distance - 20) / 2);
  } else {
    // 极短距离：排名很低，战胜0-4%
    return Math.floor(distance / 5);
  }
}

// 基于距离推算合理的排名
const calculateRankByDistance = (distance) => {
  if (distance >= 320) return Math.floor(Math.random() * 3) + 1; // 1-3名
  else if (distance >= 280) return Math.floor(Math.random() * 5) + 1; // 1-5名
  else if (distance >= 240) return Math.floor(Math.random() * 10) + 1; // 1-10名
  else if (distance >= 200) return Math.floor(Math.random() * 20) + 5; // 5-25名
  else if (distance >= 160) return Math.floor(Math.random() * 30) + 10; // 10-40名
  else if (distance >= 120) return Math.floor(Math.random() * 50) + 20; // 20-70名
  else if (distance >= 80) return Math.floor(Math.random() * 100) + 50; // 50-150名
  else if (distance >= 40) return Math.floor(Math.random() * 200) + 100; // 100-300名
  else return '未上榜'; // 距离太短，未上榜
}

// 修改onMounted函数（约第212行）
onMounted(async () => {
  try {
    // 端外环境使用基于距离的假数据算法
    const currentDistance = gameData.value.currentDistance
    const defeatPercentage = calculateDefeatPercentage(currentDistance)
    const estimatedRank = calculateRankByDistance(currentDistance)
    
    console.log(`[EndingSceneOutside] 战胜比例计算(假数据): 距离${currentDistance}m -> 推算排名${estimatedRank} -> 战胜${defeatPercentage}%`);
    
    currentUserData.value = { 
      rankPercent: defeatPercentage.toString(),
      nickName: '您'
    }
    
    // 生成模拟排行榜数据
    leaderboardData.value = generateMockLeaderboard()
    
    // 设置当前用户数据
    currentUserEntry.value = {
      rank: estimatedRank, // 使用推算的排名
      nick: "我",
      distance: currentDistance,
      stars: gameData.value.stars
    }
    
    console.log('[EndingSceneOutside] 使用假数据，推算排名:', estimatedRank, '战胜百分比:', defeatPercentage);
  } catch (e) {
    console.error('[EndingSceneOutside] 计算假数据失败:', e);
    // 降级处理
    const defeatPercentage = calculateDefeatPercentage(gameData.value.currentDistance)
    const estimatedRank = calculateRankByDistance(gameData.value.currentDistance)
    currentUserData.value = { rankPercent: defeatPercentage.toString(), nickName: '您' }
    leaderboardData.value = generateMockLeaderboard()
    currentUserEntry.value = {
      rank: estimatedRank,
      nick: "我",
      distance: gameData.value.currentDistance,
      stars: gameData.value.stars
    }
  }
})

// 生成模拟排行榜数据
function generateMockLeaderboard() {
  const mockData = []
  const nicknames = ['游泳健将', '水中飞鱼', '蛙泳大师']
  
  for (let i = 1; i <= 10; i++) {
    const stars = Math.max(1, 30 - i + Math.floor(Math.random() * 5))
    const distance = Math.max(100, 800 - i * 50 + Math.floor(Math.random() * 100))
    
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
  userStore.logCurrentPlayStats('[EndingSceneOutside] handleRestartGame clicked')
  if (!userStore.canPlay) {
    return
  }
  gameStateStore.restartGame()
}

const handleOpenApp = () => {
  clickReport({ id: 'open_app' })
  openNativeScheme('qqnews://article_9527?nm=LNK2025052211684300', 'swim')
}

const handleShareToFriendClick = () => {
  console.log('[EndingSceneOutside] handleShareToFriendClick called! 分享按钮被点击了');
  
  try {
    clickReport({ id: 'share_in_outside' })
    console.log('[EndingSceneOutside] clickReport called successfully');
  } catch (error) {
    console.error('[EndingSceneOutside] clickReport error:', error);
  }
  
  userStore.logCurrentPlayStats('[EndingSceneOutside] handleShareToFriendClick clicked')
  
  shareArrowOverlayIsVisible.value = true
  console.log('[EndingSceneOutside] shareArrowOverlayIsVisible set to true');

  console.log('[EndingSceneOutside] Share action initiated (showing arrow). Simulating share & starting 5s timer for bonus plays.')
  setTimeout(() => {
    console.log('[EndingSceneOutside] 5s timer elapsed. Granting bonus plays for outside-app share.')
    userStore.grantBonusPlays(3)
  }, 5000)
}

const handleOverlayClick = () => {
  shareArrowOverlayIsVisible.value = false
}
</script>

<style scoped>
/* 导入字体 */
@import url('https://fonts.googleapis.com/css2?family=PingFang+SC:wght@300;400;600&display=swap');

.ending-scene-outside {
  width: 100%;
  height: 100dvh;
  background-color: #171717;
  position: relative;
  overflow-y: auto; /* 添加垂直滚动 */
  overflow-x: hidden; /* 隐藏水平滚动 */
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  /* 添加移动端触摸滚动支持 */
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.background-container {
  width: 100%;
  min-height: 100%; /* 改为最小高度，允许内容超出视窗 */
  position: relative;
  padding: 0 5.33vw; /* 20px at 375px width */
  box-sizing: border-box;
  /* 计算实际内容高度，确保有足够空间 */
  height: auto;
  padding-bottom: 35vh; /* 从25vh增加到35vh，适应增加的排行榜高度 */
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
}

.title-text {
  font-family: 'MFYuanHei', 'PingFang SC', sans-serif;
  font-size: 22vw; /* 放大文字 */
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
  display: inline-block;
  line-height: 0.8;
  font-size: 22vw !important; /* 强制设置固定字体大小 */
  color: #5CBBF9;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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
  color: #E7E7E7;
  /* 预估高度: 4.5vw * 1.4 * 2行 ≈ 12.6vw ≈ 4.7vh */
}

.score-line,
.distance-line {
  margin-bottom: 1.33vw; /* 5px at 375px width */
}

.number-text {
  font-family: 'RadikalW01Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: #5CBBF9;
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
  height: 65vh; 
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  /* 添加移动端触摸滚动支持 */
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  /* 添加居中对齐 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.leaderboard-scroll-container::-webkit-scrollbar {
  width: 0;
  background: transparent; /* Chrome/Safari/Webkit */
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
  /* 添加移动端触摸支持 */
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.try-again-btn:hover,
.share-friend-btn:hover {
  transform: scale(1.05);
}

.try-again-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.try-again-btn.disabled:hover {
  transform: none;
}

/* 底部按钮遮罩 */
.bottom-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 9.26dvh; /* 67px at 723px height - 覆盖按钮区域 */
  background: rgba(23, 23, 23, 0.95);
  z-index: 0;
}

/* 分享箭头遮罩 */
.share-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.share-instruction-arrow {
  width: 26.67vw; /* 100px at 375px width */
  height: auto;
  margin-top: 2.76dvh; /* 20px at 723px height */
  margin-right: 5.33vw; /* 20px at 375px width */
}
</style>