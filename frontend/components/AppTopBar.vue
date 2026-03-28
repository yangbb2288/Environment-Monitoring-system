<template>
  <div class="app-topbar">
    <div class="topbar-left">
      <el-button v-if="showMobileMenu" type="text" @click="toggleMobileSidebar">
        <el-icon><menu /></el-icon>
      </el-button>
      <h2 class="page-title">{{ pageTitle }}</h2>
    </div>
    
    <div class="topbar-right">
      <el-dropdown>
        <span class="user-dropdown-link">
          <el-avatar :size="32" class="user-avatar">
            {{ userInitials }}
          </el-avatar>
          <span class="username">{{ userInfo?.username || '游客' }}</span>
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="navigateTo('/pages/user/profile')">
              <el-icon><user /></el-icon> 个人资料
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              <el-icon><switch-button /></el-icon> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ArrowDown, User, SwitchButton, Menu } from '@element-plus/icons-vue';

const props = defineProps({
  pageTitle: {
    type: String,
    default: '环境监测系统'
  },
  showMobileMenu: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-sidebar']);

// 用户信息
const userInfo = ref(uni.getStorageSync('userInfo') || null);

// 用户姓名首字母
const userInitials = computed(() => {
  if (!userInfo.value || !userInfo.value.username) return '?';
  return userInfo.value.username.substring(0, 1).toUpperCase();
});

// 切换移动端侧边栏
const toggleMobileSidebar = () => {
  emit('toggle-sidebar');
};

// 导航到指定路由
const navigateTo = (path) => {
  uni.navigateTo({
    url: path
  });
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
.app-topbar {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  position: fixed;
  top: 0;
  right: 0;
  left: 220px;
  z-index: 999;
  transition: left 0.3s;
  
  &.sidebar-collapsed {
    left: 64px;
  }
  
  .topbar-left {
    display: flex;
    align-items: center;
    
    .page-title {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
  }
  
  .topbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .user-dropdown-link {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      
      .user-avatar {
        background-color: var(--el-color-primary);
        color: #fff;
        font-weight: bold;
      }
      
      .username {
        font-size: 14px;
        color: var(--el-text-color-primary);
      }
    }
  }
  
  @media screen and (max-width: 768px) {
    left: 0;
    
    .page-title {
      font-size: 16px;
    }
    
    .username {
      display: none;
    }
  }
}
</style> 