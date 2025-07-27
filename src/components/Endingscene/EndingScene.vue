<template>
  <component :is="currentEndingScene" />
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../../stores/userStore'
import EndingSceneApp from './EndingSceneApp.vue'
import EndingSceneOutside from './EndingSceneOutside.vue'

const userStore = useUserStore()

const currentEndingScene = computed(() => {
  return userStore.isInQQNewsApp ? EndingSceneApp : EndingSceneOutside
})
</script>

<style scoped>
/* 包装器样式，确保与设计稿配色一致 */
.ending-scene-wrapper {
  width: 100%;
  height: 100%;
  background-color: rgb(127, 228, 255); /* 设计稿背景色：天蓝色 */
  /* 根据需要添加其他包装样式 */
}
</style> 