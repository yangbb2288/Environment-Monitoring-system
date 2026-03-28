<template>
  <div class="app-sidebar" :class="{ 'collapsed': collapsed }">
    <div class="sidebar-header">
      <!-- 移除了左上角的图标 -->
      <h3 v-if="!collapsed" class="logo-title">环境监测系统</h3>
      <el-icon class="collapse-icon" @click="toggleCollapse">
        <component :is="collapsed ? 'Expand' : 'Fold'" />
      </el-icon>
    </div>
    
    <el-menu
      :default-active="activeRoute"
      class="sidebar-menu"
      :collapse="collapsed"
      :collapse-transition="false"
      router
      unique-opened
    >
      <el-menu-item 
        v-for="item in visibleMenuItems" 
        :key="item.path" 
        :index="item.path"
        :route="item.path"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>{{ item.text }}</template>
      </el-menu-item>
    </el-menu>
    
    <div class="sidebar-footer">
      <el-tooltip v-if="collapsed" content="退出登录" placement="right">
        <el-button type="text" icon="SwitchButton" @click="logout" />
      </el-tooltip>
      
      <div v-else class="footer-content">
        <el-button type="text" @click="logout">
          <el-icon><switch-button /></el-icon>
          <span>退出登录</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { SwitchButton, Expand, Fold } from '@element-plus/icons-vue';
import { getRolePermissions, checkPagePermission } from '../utils/permission';

const props = defineProps({
  initialCollapsed: {
    type: Boolean,
    default: true // 修改默认值为true，使侧边栏默认收起
  }
});

const emit = defineEmits(['update:collapsed']);

// 路由
const route = useRoute();
const activeRoute = computed(() => '/' + route.path);

// 侧边栏折叠状态，默认收起
const collapsed = ref(props.initialCollapsed);

// 在组件挂载时设置侧边栏为收起状态
onMounted(() => {
  // 始终设置为收起状态
  collapsed.value = true;
  uni.setStorageSync('sidebarCollapsed', true);
});

// 菜单项定义
const menuItems = [
  { path: '/pages/index/index', text: '首页', icon: 'HomeFilled', page: 'pages/index/index' },
  { path: '/pages/dashboard/dashboard', text: '数据看板', icon: 'DataAnalysis', page: 'pages/dashboard/dashboard' },
  //{ path: '/pages/sensors/sensors', text: '传感器', icon: 'Connection', page: 'pages/sensors/sensors' },
  { path: '/pages/analysis/analysis', text: '数据分析', icon: 'TrendCharts', page: 'pages/analysis/analysis' },
  { path: '/pages/comparison/comparison', text: '区域对比', icon: 'PieChart', page: 'pages/comparison/comparison' },
  { path: '/pages/history/history', text: '历史回溯', icon: 'Calendar', page: 'pages/history/history' },
  { path: '/pages/warning/warning', text: '异常预警', icon: 'WarningFilled', page: 'pages/warning/warning' },
  { path: '/pages/knowledge/knowledge', text: 'RAG助手', icon: 'Reading', page: 'pages/knowledge/knowledge' }
];

// 获取用户信息和权限
const userInfo = ref(uni.getStorageSync('userInfo') || null);
const userPermissions = ref([]);

// 获取用户权限
onMounted(() => {
  if (userInfo.value && userInfo.value.role) {
    // 根据角色获取权限
    userPermissions.value = getRolePermissions(userInfo.value.role);
  }
});

// 根据权限过滤可见菜单项
const visibleMenuItems = computed(() => {
  // 如果没有用户信息，只返回首页和登录页
  if (!userInfo.value) {
    return menuItems.filter(item => 
      item.path === '/pages/index/index' || 
      item.path === '/pages/login/login'
    );
  }
  
  // 根据权限过滤
  return menuItems.filter(item => {
    // 首页总是可见
    if (item.page === 'pages/index/index') return true;
    
    // 检查用户是否有权限访问该页面
    return checkPagePermission(item.page, userPermissions.value);
  });
});

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
  emit('update:collapsed', collapsed.value);
  
  // 保存折叠状态到本地存储
  uni.setStorageSync('sidebarCollapsed', collapsed.value);
};

// 退出登录
const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: function(res) {
      if (res.confirm) {
        // 清除用户信息
        uni.removeStorageSync('userInfo');
        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.app-sidebar {
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: width 0.3s;
  width: 220px;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  
  &.collapsed {
    width: 64px;
  }
  
  .sidebar-header {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid var(--el-border-color-light);
    position: relative;
    
    .logo {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }
    
    .logo-title {
      margin: 0 0 0 12px;
      font-size: 16px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .collapse-icon {
      position: absolute;
      right: 16px;
      cursor: pointer;
      font-size: 20px;
      color: var(--el-text-color-secondary);
      
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
  
  .sidebar-menu {
    flex: 1;
    border-right: none;
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  .sidebar-footer {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-top: 1px solid var(--el-border-color-light);
    
    .footer-content {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

@media screen and (max-width: 768px) {
  .app-sidebar {
    transform: translateX(-100%);
    
    &.visible {
      transform: translateX(0);
    }
  }
}
</style> 