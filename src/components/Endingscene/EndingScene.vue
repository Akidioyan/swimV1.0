<template>
  <component :is="currentEndingScene" />
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../../../../refData/stores/userStore'
import EndingSceneApp from './EndingSceneApp.vue'
import EndingSceneOutside from './EndingSceneOutside.vue'

const userStore = useUserStore()

const currentEndingScene = computed(() => {
  return userStore.isInQQNewsApp ? EndingSceneApp : EndingSceneOutside
})
</script>

## 3. 🎮 双端组件架构

### 3.1 动态组件路由器

<style scoped>
/* 保留或移除原有样式，根据是否还需要全局样式决定 */
/* 例如，如果两个子组件的根元素都有 .ending-scene 类并且样式一致，则可以保留 */
/* 如果子组件各自管理全部样式，则这里的样式可以移除或简化 */
.ending-scene-wrapper {
  width: 100%;
  height: 100%;
  /* 根据需要添加其他包装样式 */
}
</style>