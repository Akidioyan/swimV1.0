<!--
  App.vue - 应用的根组件
  
  Vue 单文件组件 (SFC) 结构:
  1. <template> - 组件的 HTML 模板
  2. <script> - 组件的 JavaScript 逻辑
  3. <style> - 组件的 CSS 样式
  
  这种结构使组件的所有部分都集中在一个文件中，便于维护
-->
<template>
  <div class="app">
    <!-- 
      <Transition> 是 Vue 内置组件，用于在元素进入/离开 DOM 时应用动画
      name 属性定义了 CSS 过渡类的前缀，例如 fade-enter-active
    -->
    <Transition name="fade">
      <!-- 
        <component :is="..."> 是动态组件
        它根据绑定的值动态渲染不同的组件
        
        :key 属性确保组件在切换时完全重新渲染，而不是复用
        这对动画和组件状态管理很重要
      -->
      <component
        :is="currentScene"
        :key="gameStore.currentScene"
        class="scene-component"
      />
    </Transition>
  </div>
</template>

<script setup>
/**
 * <script setup> 是 Vue 3 特有的语法糖
 * 它简化了组合式 API 的使用:
 * - 内部定义的变量和函数自动暴露给模板
 * - 不需要 return 语句返回要使用的数据
 * - 导入的组件自动注册，不需要 components 选项
 */
import { computed, onMounted } from 'vue' // 恢复：移除 onMounted, onBeforeUnmount
import { useGameStore } from './stores/gameStore' // 导入状态管理
import GameScene from './components/GameScene.vue'
import LoadingScene from './components/LoadingScene.vue'
import IntroScene from './components/IntroScene.vue'
import EndingScene from './components/EndingScene.vue'
import { setShareInfo } from '@tencent/qqnews-jsapi'
import JsBridge from '@tencent/qn-jsbridge';
import { isQQNews } from '../src/utils/ua';
import { viewReport } from '../src/utils/report';

// 获取全局状态管理器实例
// useXXX 是 Vue 组合式 API 的命名约定，表示可组合的功能单元
const gameStore = useGameStore()

// 初始化分享信息
onMounted(async () => {
  viewReport();
  // 移除 loading
  document.querySelector('.loading-container')?.classList.add('hide');
  
  if (isQQNews()) {
    setShareInfo({
      title: '乒了个乓',
      longTitle: '用指尖与全网乒乓高手对决，一起来乒了个乓！？',
      content: '用指尖与全网乒乓高手对决，一起来乒了个乓！？',
      url: 'https://view.inews.qq.com/a/LNK2025052211684300?no-redirect=1',
      imgUrl: 'https://mat1.gtimg.com/rain/apub2019/42bd7e299fc4.shareimg.png',
    });
  } else {
    // 初始化后设置分享信息
    const instance = await JsBridge.readyAny();
    const shareInfo = {
      title: '乒了个乓',
      desc: '用指尖与全网乒乓高手对决，一起来乒了个乓！',
      imgUrl: 'https://mat1.gtimg.com/rain/apub2019/42bd7e299fc4.shareimg.png',
      link: 'https://view.inews.qq.com/a/LNK2025052211684300?no-redirect=1'
    };
    instance.setShareInfo(shareInfo);
  }
  gameStore.initializeAudioSystem();
})

// --- 移除动态视口高度逻辑 ---
/*
const setVhVariable = () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
onMounted(() => {
  setVhVariable();
  window.addEventListener('resize', setVhVariable);
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', setVhVariable);
})
*/
// --- 结束移除 ---

// 使用计算属性根据当前场景状态返回对应的组件
// computed 返回一个只读的响应式引用，当依赖项变化时自动重新计算
const currentScene = computed(() => {
  switch (gameStore.currentScene) {
    case 'game':
      return GameScene
    case 'loading':
      return LoadingScene
    case 'intro':
      return IntroScene
    case 'ending':
      return EndingScene
    default:
      return LoadingScene
  }
})
</script>

<!-- 
  Vue 组件可以包含 scoped 或全局样式
  不带 scoped 的样式是全局的，会影响整个应用
  这里的样式用于控制场景过渡和布局
-->
<style>
.app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: relative; /* 添加相对定位作为绝对定位元素的参考 */
  /* 如果支持dvh,则使用dvh覆盖上面的vh值 */
  @supports (height: 100dvh) {
    height: 100dvh;
  }
}

/* 场景组件的基础样式 */
.scene-component {
  position: absolute; /* 绝对定位使场景可以重叠 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 
  Vue 过渡系统的 CSS 类命名规则:
  对于名为 "fade" 的过渡:
  1. fade-enter-from: 进入前的初始状态
  2. fade-enter-active: 进入过渡生效时的状态
  3. fade-enter-to: 进入完成时的状态
  4. fade-leave-from: 离开开始时的状态
  5. fade-leave-active: 离开过渡生效时的状态
  6. fade-leave-to: 离开完成时的状态
*/

/* 定义进入和离开过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease; /* CSS 过渡属性定义动画时间和缓动函数 */
  /* 确保正在离开的场景在上层 */
  z-index: 1;
}

/* 进入的场景初始状态 */
.fade-enter-from {
  opacity: 0;
}

/* 离开的场景结束状态 */
.fade-leave-to {
  opacity: 0;
}

/* 场景的正常状态 */
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
