<template>
  <div class="result-view">
    <!-- 顶部排名和成就展示 -->
    <div class="rank-container">
      <div class="rank-desc-text">
        <template v-if="gameStateStore.finalDistance < 50">
          游泳距离不足50米，继续加油！
        </template>
        <template v-else>
          成功游了{{ gameStateStore.finalDistance }}米，获得{{ gameStateStore.score }}分，超越了全网{{ rankPercent }}%的玩家！
        </template>
      </div>
      
      <img :src="rankImageSrc" class="rank-image" alt="玩家称号">
    </div>

    <!-- 排行榜 -->
    <div class="leaderboard-container">
      <div class="leaderboard-header">
        <span class="col-rank">排名</span>
        <span class="col-nick">昵称</span>
        <span class="col-score">分数</span>
        <span class="col-distance">距离</span>
      </div>
      
      <div class="leaderboard-list">
        <!-- 当前用户行 -->
        <div class="leaderboard-row current-user-row">
          <span class="col-rank">{{ userRank }}</span>
          <span class="col-nick">我</span>
          <span class="col-score">{{ gameStateStore.score }}</span>
          <span class="col-distance">{{ gameStateStore.finalDistance }}米</span>
        </div>
        
        <!-- 排行榜数据 -->
        <div 
          v-for="(player, index) in leaderboardData" 
          :key="index"
          class="leaderboard-row"
        >
          <span class="col-rank" :class="{ 'top-rank-text': index < 3 }">{{ index + 1 }}</span>
          <span class="col-nick">{{ player.name }}</span>
          <span class="col-score">{{ player.score }}</span>
          <span class="col-distance">{{ player.distance }}米</span>
        </div>
      </div>
    </div>

    <!-- 鼓励信息 -->
    <div class="encouragement">
      <p class="encouragement-text">{{ encouragementMessage }}</p>
    </div>

    <!-- 操作按钮 -->
    <div class="button-container">
      <img 
        src="/tryAgain.png"
        class="action-image restart-image"
        @click="handleRestartGame"
        :class="{ 'disabled-image': isTryAgainDisabled }"
        alt="再来一次"
      >
      
      <img 
        src="/shareToFriend.png"
        class="action-image share-image"
        @click="handleShareResult"
        alt="分享成绩"
      >
    </div>

    <!-- 分享提示覆盖层 -->
    <div v-if="showShareOverlay" class="share-overlay" @click="handleOverlayClick">
      <img src="/shareArrow.png" class="share-instruction-arrow" alt="点击此处分享">
    </div>

    <!-- 分享弹窗 -->
    <div v-if="showSharePopup" class="popup" @click="showSharePopup = false">
      <div class="popup-content" @click.stop>
        <div class="popup-title">📤 分享游戏成绩</div>
        <div class="share-preview">
          <div class="share-text">
            我在指尖游泳中获得了 {{ gameStateStore.score }} 分！<br>
            游泳距离：{{ gameStateStore.finalDistance }}米<br>
            来挑战我的记录吧！
          </div>
        </div>
        <div class="popup-buttons">
          <button class="btn btn-primary" @click="copyToClipboard">
            📋 复制到剪贴板
          </button>
          <button class="btn btn-info" @click="showSharePopup = false">
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 分享提示图片 -->
    <img 
      v-if="showShareTipsImage" 
      ref="tipsImageRef" 
      src="/shareToFriend.png" 
      class="share-tips-image" 
      alt="分享提示"
    >
    
    <!-- 庆祝动画背景 -->
    <div class="celebration" v-if="gameStateStore.isNewRecord">
      <div class="confetti" v-for="i in 20" :key="i"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useGameStateStore } from '../stores/gamestore/gameState'

// 初始化游戏状态商店
const gameStateStore = useGameStateStore()

// 响应式状态
const showSharePopup = ref(false)
const showShareOverlay = ref(false)
const showShareTipsImage = ref(false)
const isTryAgainDisabled = ref(false)
const tipsImageRef = ref(null)
const userRank = ref(Math.floor(Math.random() * 50) + 1) // 模拟排名
const rankPercent = ref(Math.floor(Math.random() * 80) + 10) // 模拟超越百分比

// 模拟排行榜数据
const leaderboardData = ref([
  { name: '游泳冠军', score: 12500, distance: 1250 },
  { name: '水中蛟龙', score: 10800, distance: 1080 },
  { name: '海豚选手', score: 9500, distance: 950 },
  { name: '泳池健将', score: 8200, distance: 820 },
  { name: '水上飞人', score: 7600, distance: 760 },
  { name: '快乐泳者', score: 6300, distance: 630 },
  { name: '水中精灵', score: 5800, distance: 580 },
  { name: '业余选手', score: 4500, distance: 450 },
  { name: '初学游泳', score: 3200, distance: 320 },
])

// 计算属性
const achievements = computed(() => {
  const score = gameStateStore.score
  const distance = gameStateStore.finalDistance
  
  return [
    { id: 'score1k', icon: '🥉', name: '千分达人', earned: score >= 1000 },
    { id: 'score5k', icon: '🥈', name: '五千高手', earned: score >= 5000 },
    { id: 'score10k', icon: '🥇', name: '万分大师', earned: score >= 10000 },
    { id: 'distance100', icon: '🏊', name: '百米泳者', earned: distance >= 100 },
    { id: 'distance500', icon: '🏊‍♂️', name: '长距离游泳者', earned: distance >= 500 },
    { id: 'distance1k', icon: '🦈', name: '海洋征服者', earned: distance >= 1000 },
    { id: 'speed2x', icon: '⚡', name: '速度之王', earned: true }, // 简化判断
    { id: 'record', icon: '👑', name: '新纪录保持者', earned: gameStateStore.isNewRecord }
  ]
})

const encouragementMessage = computed(() => {
  const score = gameStateStore.score
  const messages = [
    { min: 0, max: 500, text: "不错的开始！多练习就能游得更远！" },
    { min: 500, max: 1000, text: "很好的进步！你已经掌握了基本技巧！" },
    { min: 1000, max: 3000, text: "出色的表现！你是一名优秀的游泳者！" },
    { min: 3000, max: 5000, text: "太棒了！你已经是游泳高手了！" },
    { min: 5000, max: 10000, text: "惊人的成绩！你是真正的游泳大师！" },
    { min: 10000, max: Infinity, text: "传奇级别的表现！你就是游泳英雄！" }
  ]
  
  const message = messages.find(m => score >= m.min && score < m.max)
  return message ? message.text : "继续加油，挑战更远的地方！"
})

const rankImageSrc = computed(() => {
  const score = gameStateStore.score
  if (score < 1000) return '/ranks/rank0.png'
  else if (score < 3000) return '/ranks/rank1.png'
  else if (score < 5000) return '/ranks/rank2.png'
  else if (score < 8000) return '/ranks/rank3.png'
  else if (score < 12000) return '/ranks/rank4.png'
  else return '/ranks/rank5.png'
})

// 生命周期钩子
onMounted(() => {
  // 模拟排名数据
  if (gameStateStore.score > 0) {
    // 根据分数插入到排行榜中的适当位置
    const playerScore = gameStateStore.score
    let insertIndex = leaderboardData.value.findIndex(player => playerScore > player.score)
    
    if (insertIndex === -1) {
      // 分数低于所有排行榜数据，放在最后
      userRank.value = leaderboardData.value.length + 1
    } else {
      userRank.value = insertIndex + 1
      // 更新排名百分比
      rankPercent.value = Math.floor((1 - insertIndex / 10) * 100)
    }
  }
})

// 方法
const handleRestartGame = () => {
  if (isTryAgainDisabled.value) {
    if (showShareTipsImage.value && tipsImageRef.value) {
      tipsImageRef.value.classList.add('tips-animate')
      setTimeout(() => {
        if (tipsImageRef.value) {
          tipsImageRef.value.classList.remove('tips-animate')
        }
      }, 500)
    }
    return
  }
  gameStateStore.restartGame()
}

const handleShareResult = () => {
  if (navigator.share) {
    navigator.share({
      title: '指尖游泳 - 我的成绩',
      text: `🏊 我在指尖游泳中获得了 ${gameStateStore.score} 分！游泳距离：${gameStateStore.finalDistance}米`,
      url: window.location.href
    }).catch(console.error)
  } else {
    // 显示分享覆盖层，模拟分享操作
    showShareOverlay.value = true
    
    // 5秒后授予额外游戏次数
    setTimeout(() => {
      showShareOverlay.value = false
      showShareTipsImage.value = false
      isTryAgainDisabled.value = false
      // 这里可以添加授予额外游戏次数的逻辑
    }, 5000)
  }
}

const handleOverlayClick = () => {
  showShareOverlay.value = false
  showSharePopup.value = true
}

const copyToClipboard = async () => {
  const text = `🏊 我在指尖游泳中获得了 ${gameStateStore.score} 分！游泳距离：${gameStateStore.finalDistance}米。来挑战我的记录吧！`
  
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    
    showSharePopup.value = false
    alert('已复制到剪贴板！')
    
    // 复制成功后授予额外游戏次数
    showShareTipsImage.value = false
    isTryAgainDisabled.value = false
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.result-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #0f80dc; /* 修改背景颜色 */
  position: relative;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 排名和奖杯区域 */
.rank-container {
  position: relative;
  top: 1vh; /* 减少顶部间距 */
  width: 95%; /* 增加宽度利用率 */
  max-width: 600px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rank-desc-text {
  font-size: 16px;
  color: #fff;
  text-align: center;
  width: 100%;
  margin-bottom: 10px;
  line-height: 1.4;
}

.rank-image {
  display: block;
  height: 80px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  margin-bottom: 15px;
}

.trophy-display-area {
  width: 100%;
  margin-bottom: 20px;
}

.trophy-backboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.trophy-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 10px;
}

.trophies-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.trophy-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.trophy-item.lit {
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.5);
  opacity: 1;
  animation: achievementPop 0.6s ease-out;
}

.trophy-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.trophy-name {
  font-size: 10px;
  color: white;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* 排行榜样式 */
.leaderboard-container {
  width: 90%;
  max-width: 500px;
  margin-top: 20px;
  margin-bottom: 20px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  padding: 15px;
  box-sizing: border-box;
  z-index: 2;
}

.leaderboard-header,
.leaderboard-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  color: white;
  font-size: 14px;
}

.leaderboard-header {
  background-color: rgba(0, 0, 0, 0.3);
  font-weight: bold;
}

.leaderboard-row.current-user-row {
  background-color: rgba(61, 205, 88, 0.3);
}

.leaderboard-row:not(.current-user-row) {
  background-color: rgba(47, 58, 143, 0.3);
}

.leaderboard-list {
  max-height: 250px;
  overflow-y: auto;
  scrollbar-width: none;
}

.leaderboard-list::-webkit-scrollbar {
  display: none;
}

.col-rank,
.col-score,
.col-distance {
  flex-basis: 20%;
  text-align: center;
  white-space: nowrap;
}

.col-nick {
  flex-basis: 40%;
  text-align: left;
  padding-left: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-rank.top-rank-text {
  color: #FFD700;
  font-weight: bold;
}

/* 鼓励信息 */
.encouragement {
  width: 90%;
  max-width: 500px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 20px;
  z-index: 2;
}

.encouragement-text {
  color: white;
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
}

/* 按钮容器 */
.button-container {
  position: relative;
  bottom: 0;
  width: 90%;
  max-width: 500px;
  display: flex;
  justify-content: space-around;
  gap: 15px;
  margin-top: 10px;
  margin-bottom: 20px;
  z-index: 2;
}

.image-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  border: none;
  border-radius: 15px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.restart-button {
  background: linear-gradient(135deg, #4b6cb7, #182848);
}

.share-button {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}

.button-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.home-button {
  background: linear-gradient(135deg, #f46b45, #eea849);
}

.button-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.button-text {
  font-size: 14px;
}

.action-image {
  width: 120px;
  height: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
}

.action-image:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.disabled-image {
  opacity: 0.5;
  cursor: not-allowed;
}

.disabled-image:hover {
  transform: none;
  box-shadow: none;
}

/* 分享覆盖层 */
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
  width: 100px;
  height: auto;
  margin-top: 20px;
  margin-right: 20px;
}

/* 分享提示图片 */
.share-tips-image {
  position: absolute;
  bottom: 100px;
  left: 70%;
  transform: translateX(-50%);
  width: 60%;
  max-width: 250px;
  height: auto;
  z-index: 5;
  pointer-events: none;
}

.tips-animate {
  animation: pulse-scale 0.5s ease-in-out;
}

@keyframes pulse-scale {
  0% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.15);
  }
  100% {
    transform: translateX(-50%) scale(1);
  }
}

/* 分享弹窗 */
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
}

.popup-content {
  background-color: #2a4d69;
  border-radius: 15px;
  padding: 20px;
  width: 80%;
  max-width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.popup-title {
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin-bottom: 15px;
  text-align: center;
}

.share-preview {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  margin: 15px 0;
}

.share-text {
  color: white;
  font-size: 14px;
  line-height: 1.5;
}

.popup-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-info {
  background-color: #2196F3;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

/* 庆祝动画 */
.celebration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
  animation: confettiFall 3s linear infinite;
}

.confetti:nth-child(odd) {
  background: linear-gradient(45deg, #feca57, #ff9ff3, #54a0ff);
}

.confetti:nth-child(1) { left: 10%; animation-delay: 0s; }
.confetti:nth-child(2) { left: 20%; animation-delay: 0.5s; }
.confetti:nth-child(3) { left: 30%; animation-delay: 1s; }
.confetti:nth-child(4) { left: 40%; animation-delay: 0.3s; }
.confetti:nth-child(5) { left: 50%; animation-delay: 0.8s; }
.confetti:nth-child(6) { left: 60%; animation-delay: 0.2s; }
.confetti:nth-child(7) { left: 70%; animation-delay: 0.7s; }
.confetti:nth-child(8) { left: 80%; animation-delay: 0.4s; }
.confetti:nth-child(9) { left: 90%; animation-delay: 0.9s; }
.confetti:nth-child(10) { left: 15%; animation-delay: 0.6s; }

@keyframes confettiFall {
  0% { 
    transform: translateY(-100px) rotate(0deg);
    opacity: 1;
  }
  100% { 
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

@keyframes achievementPop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
</style>
