<template>
  <div class="app-navigation">
    <div class="app-navigation-content">
      <el-affix :offset="0" class="desktop-nav">
        <el-menu 
          :default-active="activeIndex" 
          mode="horizontal" 
          router
          class="nav-menu"
          @select="handleSelect"
        >
          <el-menu-item v-for="item in visibleMenuItems" :key="item.path" :index="item.path" :route="item.path">
            <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
            <span>{{ item.text }}</span>
          </el-menu-item>
          
          <div class="flex-spacer"></div>
          
          <el-dropdown v-if="userInfo" class="user-dropdown">
            <span class="user-dropdown-link">
              <el-avatar :size="32" class="user-avatar">
                {{ userInitials }}
              </el-avatar>
              <span class="username">{{ userInfo.username }}</span>
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
        </el-menu>
      </el-affix>
      
      <!-- 移动端导航栏 -->
      <div class="mobile-nav">
        <el-button v-if="hasBack" icon="ArrowLeft" text @click="goBack" class="back-button" />
        <h3 class="mobile-title">{{ pageTitle }}</h3>
        <el-dropdown v-if="userInfo" trigger="click">
          <el-avatar :size="32" class="user-avatar">{{ userInitials }}</el-avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in visibleMenuItems" :key="item.path" @click="navigateTo(item.path)">
                <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
                {{ item.text }}
              </el-dropdown-item>
              <el-dropdown-item divided @click="logout">
                <el-icon><switch-button /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { ArrowDown, User, SwitchButton } from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'AppNavigation',
  components: {
    ArrowDown,
    User,
    SwitchButton
  },
  props: {
    hasBack: {
      type: Boolean,
      default: false
    },
    pageTitle: {
      type: String,
      default: '环境监测系统'
    }
  },
  setup(props) {
    // 使用uni-app的API获取用户信息
    const userInfo = ref(uni.getStorageSync('userInfo') || null);
    const router = useRouter();
    const route = useRoute();
    
    // 菜单项定义
    const menuItems = [
      { path: '/pages/index/index', text: '首页', icon: 'HomeFilled' },
      { path: '/pages/dashboard/dashboard', text: '数据看板', icon: 'DataAnalysis' },
      { path: '/pages/sensors/sensors', text: '传感器', icon: 'Connection' },
      { path: '/pages/analysis/analysis', text: '数据分析', icon: 'TrendCharts' },
      { path: '/pages/comparison/comparison', text: '区域对比', icon: 'PieChart' },
      { path: '/pages/history/history', text: '历史回溯', icon: 'Calendar' },
      { path: '/pages/warning/warning', text: '异常预警', icon: 'WarningFilled' },
      { path: '/pages/knowledge/knowledge', text: 'RAG助手', icon: 'Reading' }
    ];
    
    // 根据权限过滤可见菜单项
    const visibleMenuItems = computed(() => {
      // 如果没有用户信息，只返回首页和登录页
      if (!userInfo.value) {
        return menuItems.filter(item => 
          item.path === '/pages/index/index' || 
          item.path === '/pages/login/login'
        );
      }
      
      // 基于用户角色过滤菜单项
      // 实际应用中可以根据用户权限更精细地控制
      const role = userInfo.value.role;
      
      // 环保部门可以看所有
      if (role === 'environmental') {
        return menuItems;
      }
      
      // 城市管理者隐藏某些页面
      if (role === 'cityManager') {
        return menuItems.filter(item => 
          item.path !== '/pages/sensors/sensors'
        );
      }
      
      // 公众只能看部分页面
      if (role === 'public') {
        return menuItems.filter(item => 
          item.path === '/pages/index/index' || 
          item.path === '/pages/dashboard/dashboard' || 
          item.path === '/pages/history/history'
        );
      }
      
      return menuItems;
    });
    
    // 用户姓名首字母
    const userInitials = computed(() => {
      if (!userInfo.value || !userInfo.value.username) return '?';
      return userInfo.value.username.substring(0, 1).toUpperCase();
    });
    
    // 当前活动菜单项
    const activeIndex = computed(() => {
      return '/' + route.fullPath;
    });
    
    // 处理菜单选择
    const handleSelect = (key) => {
      navigateTo(key);
    };
    
    // 导航到指定路由
    const navigateTo = (path) => {
      uni.navigateTo({
        url: path
      });
    };
    
    // 返回上一页
    const goBack = () => {
      uni.navigateBack();
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
    
    return {
      userInfo,
      menuItems,
      visibleMenuItems,
      userInitials,
      activeIndex,
      handleSelect,
      navigateTo,
      goBack,
      logout
    };
  }
};
</script>

<style lang="scss" scoped>
.app-navigation {
  width: 100%;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  
  .app-navigation-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .desktop-nav {
    display: block;
    
    @media screen and (max-width: 768px) {
      display: none;
    }
  }
  
  .mobile-nav {
    display: none;
    padding: 12px 16px;
    align-items: center;
    justify-content: space-between;
    
    @media screen and (max-width: 768px) {
      display: flex;
    }
    
    .mobile-title {
      margin: 0;
      font-size: 16px;
      color: var(--el-text-color-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      max-width: 60%;
    }
  }
  
  .nav-menu {
    display: flex;
    
    .el-menu-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .flex-spacer {
      flex: 1;
    }
  }
  
  .user-dropdown {
    display: flex;
    align-items: center;
    margin: 0 16px;
    cursor: pointer;
    
    .user-dropdown-link {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
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
</style> 