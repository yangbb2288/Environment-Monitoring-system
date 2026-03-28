<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <app-sidebar 
      v-if="!isLoginPage"
      v-model:collapsed="sidebarCollapsed" 
      :initialCollapsed="sidebarCollapsed"
      :class="{ 'mobile-visible': mobileSidebarVisible }"
    />
    
    <app-topbar 
      v-if="!isLoginPage"
      :class="{ 'sidebar-collapsed': sidebarCollapsed }"
      :page-title="pageTitle"
      :show-mobile-menu="true"
      @toggle-sidebar="toggleMobileSidebar"
    />
    
    <!-- 遮罩层，用于移动端点击关闭侧边栏 -->
    <div 
      v-if="mobileSidebarVisible" 
      class="mobile-mask" 
      @click="closeMobileSidebar"
    ></div>
    
    <div class="app-main" :class="{ 
      'sidebar-collapsed': sidebarCollapsed,
      'no-sidebar': isLoginPage
    }">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppSidebar from './AppSidebar.vue';
import AppTopBar from './AppTopBar.vue';

const props = defineProps({
  pageTitle: {
    type: String,
    default: '环境监测系统'
  }
});

const route = useRoute();

// 判断是否在登录页
const isLoginPage = computed(() => {
  const path = route.path;
  return path.includes('/login') || path.includes('/register');
});

// 侧边栏折叠状态，默认收起
const sidebarCollapsed = ref(true);

// 移动端侧边栏可见性
const mobileSidebarVisible = ref(false);

  // 初始化侧边栏状态
onMounted(() => {
  // 始终设置为收起状态
  sidebarCollapsed.value = true;
  uni.setStorageSync('sidebarCollapsed', true);
  
  // 监听屏幕尺寸变化
  window.addEventListener('resize', handleResize);
  handleResize();
});

// 处理屏幕尺寸变化
const handleResize = () => {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    // 在移动端默认收起侧边栏
    sidebarCollapsed.value = true;
    mobileSidebarVisible.value = false;
  }
};

// 切换移动端侧边栏可见性
const toggleMobileSidebar = () => {
  mobileSidebarVisible.value = !mobileSidebarVisible.value;
};

// 关闭移动端侧边栏
const closeMobileSidebar = () => {
  mobileSidebarVisible.value = false;
};
</script>

<style lang="scss" scoped>
.app-layout {
  position: relative;
  min-height: 100vh;
  
  .app-main {
    padding-left: 220px; /* 侧边栏宽度 */
    padding-top: 60px; /* 顶部导航栏高度 */
    transition: padding-left 0.3s;
    min-height: 100vh;
    
    &.sidebar-collapsed {
      padding-left: 64px;
    }
    
    &.no-sidebar {
      padding-left: 0;
      padding-top: 0;
    }
  }
  
  .mobile-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: none;
  }
}

@media screen and (max-width: 768px) {
  .app-layout {
    .app-main {
      padding-left: 0;
    }
    
    .app-sidebar {
      transform: translateX(-100%);
      
      &.mobile-visible {
        transform: translateX(0);
      }
    }
    
    .mobile-mask {
      display: block;
    }
  }
}
</style> 